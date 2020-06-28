function jsBridge(callback) {
  setupWebViewJavascriptBridge(callback);
}

/**
 * Get user data
 * @param {Function} callback - triggers when get data or canceled
 * @param {Boolean} forceLogin - force to show native login modal when not logged, default true
 */
jsBridge.getUserData = function jsBridgeGetUserData(callback, forceLogin) {
  setupWebViewJavascriptBridge((WebViewJavascriptBridge) => {
    let params = '';

    if (forceLogin !== false) {
      params = JSON.stringify({
        forceLogin: true,
      });
    }

    WebViewJavascriptBridge.callHandler('user', params, (data) => {
      const json = JSON.parse(data).data;
      if (typeof callback === 'function') {
        callback(json || {});
      }
    });
  });
};

/**
 * Set user data
 * @param {Mixed} userData - {
 *  cityId, cityName, mobile, avatar, userName, userId, userToken, gender
 * } or false
 * @param {Function} callback
 */
jsBridge.setUserData = function jsBridgeSetUserData(userData, callback) {
  setupWebViewJavascriptBridge((WebViewJavascriptBridge) => {
    let params;

    if (userData) {
      const data = {};
      Object.keys(userData).forEach((key) => {
        data[key] = String(userData[key]);
      });
      params = JSON.stringify(data);
    } else {
      params = '';
    }

    WebViewJavascriptBridge.callHandler('setUser', params, () => {
      if (typeof callback === 'function') {
        callback();
      }
    });
  });
};

/**
 * Get app deviceId
 * @param {Function} callback - triggers when get data or canceled
 */
jsBridge.getDeviceId = function jsBridgeGetDeviceId(callback) {
  if (typeof window !== 'undefined') {
    try {
      const matches = /DeviceId\/([A-Za-z0-9-]+)/.exec(window.navigator.userAgent);
      if (matches && matches[1]) {
        callback(matches[1]);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      callback('');
    }
  }
};

/**
 * Set share params
 * @param {Object} params - {
 *  title: '', //标题
 *  imgUrl: '', //小图标
 *  desc: '', // 描述
 *  url: '' // 链接
 *  miniProgramId: String,  // optional, 小程序 AppID
 *  miniProgramPath: String, // optional, 小程序页面
 *  miniProgramThumbnail: String, // optional, 小程序链接缩略图
 *  shareBase64: String
 *  shareType: String, 为'1'时分享base64图片
 * }
 * @param {Function} callback - triggers when share success
 */
jsBridge.doShare = function jsBridgeDoShare(params, callback) {
  setupWebViewJavascriptBridge((WebViewJavascriptBridge) => {
    // eslint-disable-next-line no-param-reassign
    WebViewJavascriptBridge.WVJBdoShareCallback = (data) => {
      if (typeof callback === 'function') {
        callback(JSON.parse(data));
      }
    };

    WebViewJavascriptBridge.callHandler('doShare', JSON.stringify(paramsTransformer(params)), (data) => {
      if (typeof callback === 'function') {
        callback(JSON.parse(data));
      }
    });
  });
};

/**
 * Show menu, Share to Wechat Friend, Share to Wechat timeline, Send sms or copyLink
 * @param {Object} params - {
 *  type: 'menu/friend/timeline/sms/copyLink', // default is menu
 *  title: '', // 标题
 *  desc: '', // 描述
 *  imgUrl: '', // icon url
 *  url: '' // 链接
 *  miniProgramId: String,  // optional, 小程序 AppID
 *  miniProgramPath: String, // optional, 小程序页面
 *  miniProgramThumbnail: String, // optional, 小程序链接缩略图
 * }
 * @param {Function} callback - triggers when share success
 */
jsBridge.xShare = function jsBridgeXShare(params, callback) {
  setupWebViewJavascriptBridge((WebViewJavascriptBridge) => {
    WebViewJavascriptBridge.callHandler('xShare', JSON.stringify(paramsTransformer(params)), (data) => {
      if (typeof callback === 'function') {
        callback(JSON.parse(data));
      }
    });
  });
};
/**
 * Share Image to Wechat friend/timeline
 * @param {Object} params - {
 *  shareType: 'friend/timeline', [required]
 *  shareBase64: '', // base64 string, [required]
 * }
 * @param {Function} callback - triggers when share success
 */
jsBridge.imageShare = function jsBridgeImageShare(params, callback) {
  setupWebViewJavascriptBridge((WebViewJavascriptBridge) => {
    const param = {
      shareType: params.type,
      shareBase64: params.shareBase64,
    };
    WebViewJavascriptBridge.callHandler('imageShare', JSON.stringify(param), (data) => {
      if (typeof callback === 'function') {
        callback(JSON.parse(data));
      }
    });
  });
};

/**
 * Share Image to Wechat friend/timeline
 * @param {Object} params - {
 *  type: 'loupan,cpHouse,apHouse', [required]
 *  id: '', // houseid, [required]
 * }
 * @param {Function} callback - triggers when share success
 */
jsBridge.houseShare = function jsBridgeHouseShare(params, callback) {
  setupWebViewJavascriptBridge((WebViewJavascriptBridge) => {
    const param = {
      type: params.type,
      id: String(params.id),
    };
    WebViewJavascriptBridge.callHandler('houseShare', JSON.stringify(param), (data) => {
      if (typeof callback === 'function') {
        callback(JSON.parse(data));
      }
    });
  });
};

/**
 * Pay with native component
 * @param {Object} params - {
 *   buyerId: '', //用户ID
 *   sign: ''//签名,创建订单的时候生成的
 *   orderId｜orderNo: 订单ID,
 *   spId: 20， //表示二手房
 *   subject: // 标题
 *   body: // 简介
 *   accountId｜szAccountId: // 付款方的帐号
 *   feeType: '201' // 二手房服务费代码
 *   amount: // 金额
 *   payTo: // 收款方: 写死“房多多”,
 *   allowBankChannel: '1,5' //1微信 5支付宝
 * }
 * @param {Function} callback - triggers when share success
 */
jsBridge.pay = function jsBridgePay(params, callback) {
  setupWebViewJavascriptBridge((WebViewJavascriptBridge) => {
    const paramsData = { ...params };
    if (!paramsData.accountId && paramsData.szAccountId) {
      paramsData.accountId = paramsData.szAccountId;
    }

    if (!paramsData.orderId && paramsData.orderNo) {
      paramsData.orderId = paramsData.orderNo;
    }

    WebViewJavascriptBridge.callHandler('pay', JSON.stringify(paramsData), (data) => {
      if (typeof callback === 'function') {
        callback(JSON.parse(data));
      }
    });
  });
};

/**
 * Get data from projectA through app
 * @param {Object} params - {
 *   path: '',// GET时参数拼接在path后面 e.g. /meta/hotlines?city_id=121
 *   method: 'GET', // GET/POST/PUT/DELETE,
 *   data: '' //
 * }
 * @param {Function} callback - triggers when share success
 */
jsBridge.data = function jsBridgeData(params, callback) {
  setupWebViewJavascriptBridge((WebViewJavascriptBridge) => {
    WebViewJavascriptBridge.callHandler('data', JSON.stringify({
      path: params.path,
      method: params.method || 'GET',
      data: params.data || '',
    }), (data) => {
      if (typeof callback === 'function') {
        callback(JSON.parse(data));
      }
    });
  });
};

/**
 * check app installed
 * @param {Object} params - {
 *  type: (Enum string) ddws|ddjj|fdd|kekezhuan
 * }
 * @param {Function} callback
 */
jsBridge.checkAppInstalled = function checkAppInstalled(params, callback) {
  setupWebViewJavascriptBridge((WebViewJavascriptBridge) => {
    WebViewJavascriptBridge.callHandler('checkAppInstalled', JSON.stringify({
      type: params.type || 'fdd',
    }), (data) => {
      if (typeof callback === 'function') {
        callback(JSON.parse(data));
      }
    });
  });
};

/**
 * menu
 * @param {Object} params - {
  * menus: [
  *  {"text": "添加房源", "type": "1"},
  *  {"text": "添加新房", "type": "2"}
  * ],
  * "icon": 1,
  * "show": true
 * }
 * @param {Function} callback
 */
jsBridge.menu = function menu(params, callback) {
  setupWebViewJavascriptBridge((WebViewJavascriptBridge) => {
    // eslint-disable-next-line no-param-reassign
    WebViewJavascriptBridge.WVJBmenuCallback = (type) => {
      if (typeof callback === 'function') {
        callback(type);
      }
    };

    WebViewJavascriptBridge.callHandler('menu', JSON.stringify(params), (type) => {
      if (typeof callback === 'function') {
        callback(type);
      }
    });
  });
};

/**
 * Call a handler generally
 * @param {String} handler name
 * @param {Object} params - { any }
 * @param {Function} callback
 */
jsBridge.callHandler = function callHandler(handleName, params, callback) {
  setupWebViewJavascriptBridge((WebViewJavascriptBridge) => {
    WebViewJavascriptBridge.callHandler(handleName, JSON.stringify(params), (data) => {
      if (typeof callback === 'function') {
        callback(JSON.parse(data));
      }
    });
  });
};

/**
 * download image
 * @param {Object} params - {
 *  url: string
 * }
 * @param {Function} callback
 */
jsBridge.downloadImage = function downloadImage(params, callback) {
  setupWebViewJavascriptBridge((WebViewJavascriptBridge) => {
    WebViewJavascriptBridge.callHandler('downloadImage', JSON.stringify(params), (data) => {
      if (typeof callback === 'function') {
        callback(JSON.parse(data));
      }
    });
  });
};

module.exports = jsBridge;
