const path = require('path');
const apmClient = require('elastic-apm-node');

// eslint-disable-next-line import/no-dynamic-require
const pkg = require(path.resolve('package.json'));

function getServerConfig() {
  const env = process.env.NODE_ENV || 'development';

  const apmServerUrls = {
    testing: 'http://elastic-apm.dc.fdd',
    production: 'http://elastic-apm.dc.fdd',
  };

  const active = !!apmServerUrls[env];
  let appName = pkg.name || 'noappname';
  // a-z, A-Z, 0-9, -, _
  appName = appName.replace(/[^a-z0-9-_]/ig, '-');

  return {
    appName,
    serverUrl: apmServerUrls[env] || apmServerUrls.testing,
    active,
  };
}

const config = getServerConfig();

const apm = apmClient.start({
  serviceName: config.appName,

  secretToken: '',

  serverUrl: config.serverUrl,

  serverTimeout: 2000,
  active: config.active,
});

const myApm = {
  /**
   * huoqu
   * @param {number} a a
   * @param {number} b b
   */
  getApm: function getApm(a, b) {
    return apm;
  },
  name: 'sss',
  test: {
    a: 'a',
    b: 1,
  },
};

module.exports = myApm;
