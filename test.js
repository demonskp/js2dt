const redis = require('redis');
const crypto = require('crypto');
const zlib = require('zlib');
const { debug, debugForever } = require('@fdd/debug');

const logError = debugForever('@fdd/redisCacheSetup');
const log = debug('@fdd/redisCacheSetup');

const defaultConfig = {
  // prefix: 'hello:world',
  host: '127.0.0.1',
  port: 6379,
  // fix docker cluster mode
  no_ready_check: true,
  // delete queue and emmit an error immediately when redis crashes
  enable_offline_queue: false,
  retry_strategy(options) {
    logError('redis retry_strategy %o', options);
    return 5000;
  },
  // Set the specified expire time, in seconds
  // expire: 100,
  ping: 10000,
};

// default expire 1 day
const defaultExpire = 86400;
const cacheHashKey = 'cachehash';

class RedisCacheSetup {
  constructor(config) {
    if (config) {
      this.init(config);
      this.cacheEnabled = true;
    }
  }

  /**
   * @cacheParam { string or object that can be stringified }
   * get redis cache key by cache params
   */
  static getCacheNameByParam(cacheParam) {
    const type = Object.prototype.toString.call(cacheParam);
    if (type === '[object Undefined]' || type === '[object Null]') {
      return null;
    }

    const hash = crypto.createHash('sha1');

    hash.update(JSON.stringify(cacheParam), 'utf8');

    return hash.digest('hex');
  }

  init(config) {
    const redisConfig = {
      ...defaultConfig,
      ...config,
    };
    this.config = redisConfig;
    this.client = this.createClient(redisConfig);
  }

  createClient(config) {
    log('CREATE CLIENT %o', config);
    const client = redis.createClient(config);
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    // ping redis server per 5 minute
    this.pingInterval = setInterval(() => {
      log('PING');
      client.ping((...args) => {
        log('PONG %o', args);
      });
    }, config.ping);

    client.on('connect', () => {
      log('connect');
    });

    client.on('ready', () => {
      log('ready');
    });

    client.on('reconnecting', () => {
      log('reconnecting');
    });

    client.on('error', (err) => {
      logError('client error %o', err);
    });
    return client;
  }

  /**
   * @param cacheParam string or object identify a cache
   * @param getDataHandler used to get data and save data;
   *        Won't trigger this function when get a cache from
   *        redis server
   * @param callback callback data
   * @param apiConfig {expire, deleteCacheMethod} deleteCacheMethod: testing/delete/deleteAll/null
   */
  setup(cacheParam, getDataHandler, callback, apiConfig) {
    log('setup cacheParam %o', cacheParam);
    const deleteCacheMethod = apiConfig ? apiConfig.deleteCacheMethod : null;
    const useCache = this.cacheEnabled && !deleteCacheMethod && this.client && apiConfig;

    const cacheName = RedisCacheSetup.getCacheNameByParam(cacheParam);

    let expire = defaultExpire;
    let compress = false;

    if (apiConfig) {
      ({ expire } = apiConfig);
      compress = Boolean(apiConfig.compress);
    }

    if (useCache) {
      this.redisGet(cacheName, compress, (err, data1) => {
        if (data1 !== null) {
          log('callback %o', data1);
          callback(null, data1);
        } else {
          log('getDataHandler %o', cacheParam);

          getDataHandler((error, data) => {
            log('callback %o', data);
            callback(error, data);

            if (!err && !error) {
              this.cache(cacheName, JSON.stringify(data), expire, compress);
            }
          });
        }
      });
    } else {
      log('getDataHandler %o', cacheParam);
      getDataHandler((error, data) => {
        log('callback %o', data);
        callback(error, data);
      });
    }

    if (deleteCacheMethod) {
      if (deleteCacheMethod === 'delete') {
        this.deleteOneCache(cacheName);
      } else if (deleteCacheMethod === 'deleteAll') {
        this.deleteAllCache();
      } else if (deleteCacheMethod !== 'testing') {
        logError('deleteCacheMethod can only be `delete` `deleteAll` or `testing` but you use `%s`', deleteCacheMethod);
      }
    }
  }

  /**
   * get redis cache by cache key
   */
  redisGet(cacheName, compress, callback) {
    if (!this.client) {
      callback(null, null);
      return;
    }

    this.client.get(cacheName, (err, reply) => {
      if (err) {
        logError('redisGet error %o', err);
        callback(err, null);
        return;
      }

      if (reply) {
        if (compress) {
          const buffer = Buffer.from(reply, 'base64');

          zlib.unzip(buffer, (err1, buffer1) => {
            if (!err1) {
              callback(null, JSON.parse(buffer1.toString()));
            } else {
              callback(err1, null);
            }
          });
        } else {
          callback(null, JSON.parse(reply));
        }
      } else {
        callback(null, null);
      }
    });
  }

  /**
   * set redis
   * @expire { number or null or undefined or false }
   */
  redisSet(cacheName, dataString, expire) {
    if (!this.client) {
      return;
    }

    const expireType = Object.prototype.toString.call(expire);
    let expireTimebySecond = Number(expire);

    if (expireType === '[object Null]' || expire === false) {
      expireTimebySecond = 0;
    } else if (expireType === '[object Undefined]') {
      expireTimebySecond = defaultExpire;
    } else {
      expireTimebySecond = Number(expire);
    }

    if (expireTimebySecond > 0) {
      this.client.set(cacheName, dataString, 'EX', expireTimebySecond);
    } else {
      this.client.set(cacheName, dataString);
    }
  }

  cache(cacheName, dataString, expire, compress) {
    if (!compress) {
      this.redisSet(cacheName, dataString, expire);
    } else {
      zlib.deflate(dataString, (err, buffer) => {
        if (!err) {
          this.redisSet(cacheName, buffer.toString('base64'), expire);
        } else {
          logError('zlib.deflate error %o', err);
        }
      });
    }
    if (this.client) {
      this.client.hset(cacheHashKey, cacheName, 1);
    }
  }

  /**
   * get redis cache by params, callback error, data or null
   * @param cacheParam { string or object that can be stringified }
   * @param compress {Boolean} whether use zlib to compress results
   * @param callback {Function} callback(error, data);
   */
  getCacheByParam(cacheParam, compress, callback) {
    const type = Object.prototype.toString.call(cacheParam);
    if (type === '[object Undefined]' || type === '[object Null]' || !this.client) {
      callback(null, null);
      return;
    }

    const cacheName = RedisCacheSetup.getCacheNameByParam(cacheParam);

    this.redisGet(cacheName, compress, callback);
  }

  /**
   * set redis cache by params, callback error, data or null
   * @param cacheParam { string or object that can be stringified }
   * @param compress {Boolean} whether use zlib to compress results
   * @param callback {Function} callback(error, data);
   */
  setCacheByParam(cacheParam, data, apiConfig) {
    const deleteCacheMethod = apiConfig ? apiConfig.deleteCacheMethod : null;
    const type = Object.prototype.toString.call(cacheParam);
    if (type === '[object Undefined]' || type === '[object Null]' || !this.client) {
      return;
    }

    const { expire, compress } = apiConfig || {};
    const cacheName = RedisCacheSetup.getCacheNameByParam(cacheParam);

    if (deleteCacheMethod) {
      if (deleteCacheMethod === 'delete') {
        this.deleteOneCache(cacheName);
      } else if (deleteCacheMethod === 'deleteAll') {
        this.deleteAllCache();
      } else if (deleteCacheMethod !== 'testing') {
        logError('deleteCacheMethod can only be `delete` `deleteAll` or `testing` but you use `%s`', deleteCacheMethod);
      }
    } else {
      this.cache(cacheName, JSON.stringify(data), expire, compress);
    }
  }

  /**
   * @param cacheName should replace client prefix with ''
   */
  deleteOneCache(cacheName) {
    if (this.client) {
      this.client.del(cacheName);
    }
  }

  deleteAllCache(callback, pattern) {
    let cursor = 0;

    const deleteCache = () => {
      if (this.client) {
        this.client.hscan(
          cacheHashKey,
          cursor,
          // 'MATCH', pattern || `${this.config.prefix}*`,
          'COUNT', 10000,
          (err, response) => {
            if (err) {
              logError('redisCacheSetup.deleteAllCache error %o', err);
              if (typeof callback === 'function') {
                callback(err);
              }
              return;
            }

            // Update the cursor position for the next scan
            [cursor] = response;
            // get the SCAN responseult for this iteration
            const keys = response[1];

            logError('redisCacheSetup.deleteAllCache deleted %s cache, pattern: %s', keys.length / 2, pattern || `${this.config.prefix}*`);

            if (keys.length > 0) {
              for (let i = 0; i < keys.length; i += 2) {
                this.client.hdel(cacheHashKey, keys[i]);
                this.client.del(keys[i]);
                log('deleted key: %s', keys[i]);
              }
            }

            if (cursor === '0') {
              // this.client.del(cacheHashKey);
              if (typeof callback === 'function') {
                callback(null);
              }
              return;
            }

            deleteCache();
          },
        );
      }
    };

    deleteCache();
  }

  open() {
    this.cacheEnabled = true;
  }

  close() {
    this.cacheEnabled = false;
  }
}

module.exports = RedisCacheSetup;
