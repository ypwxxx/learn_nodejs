const CCConst = require('CCConst');

var platform = function () {
    if (window.GameConfig) {
        return window.GameConfig.platform
    }
    if (window.tt) {
        return CCConst.PLATFORM.TT;
    } else if (window.qq) {
        return CCConst.PLATFORM.QQ;
    } else if (window.wx && !window.qq && !window.tt) { //用一个小游戏的函数来判断
        return CCConst.PLATFORM.WEIXIN;
    } else if (window.swan) {
        return CCConst.PLATFORM.BAIDU;
    } else if (typeof (FBInstant) != 'undefined' && FBInstant.getPlatform()) {
        return CCConst.PLATFORM.FACEBOOK;
    } else if (typeof mqq != 'undefined') {
        return CCConst.PLATFORM.QZONE;
    } else if (cc.sys.platform == cc.sys.QQ_PLAY && typeof(BK) !== 'undefined') {
        return CCConst.PLATFORM.QQPLAY;
    } else if (window.qg) {
        if (cc.sys.platform == cc.sys.VIVO_GAME || cc.sys.platform == 3) {
            return CCConst.PLATFORM.VIVO;
        } else if (cc.sys.platform == cc.sys.OPPO_GAME) {
            return CCConst.PLATFORM.OPPO;
        } else {
            return CCConst.PLATFORM.XIAOMI;
        }
    } else if (window.hbs) {
        return CCConst.PLATFORM.HUAWEI;
    } else {
        return 0;
    }
}();
var api = (function () {
    if (window.GameConfig) {
        switch (window.GameConfig.platform) {
            case 1:
                return wx;
            case 5:
                return qg;
            case 6:
                return qg;
            case 7:
                return qq;
            case 8:
                return tt;
            case 9:
                return swan;
            case 11:
                return qg;
            default:
                break;
        }
    }
    if (window.qq) {
        return qq;
    } else if (window.tt) {
        return tt;
    } else if (window.wx && !window.qq && !window.tt) {
        return wx;
    } else if (window.qg) {
        return qg;
    } else if (window.swan) {
        return swan;
    } else {
        return 0
    }
})();

var Global = {};
Global.api = api
Global.platform = platform;

if (platform == CCConst.PLATFORM.WEIXIN) {
    var systemInfo = wx.getSystemInfoSync();
    // API版本号
    Global.apiVer = systemInfo.SDKVersion;
    // 系统类型
    if (systemInfo.system.indexOf("iOS") !== -1) {
        Global.system = 1;
    } else {
        Global.system = 0;
    }
    //客户端版本号
    Global.version = systemInfo.version;

} else if (platform == CCConst.PLATFORM.QQPLAY) {
    var systemInfo = BK.getSystemInfoSync();
    // 游戏版本号
    Global.apiVer = systemInfo.gameVersion;
    // 是否房主
    Global.isMaster = !!systemInfo.isMaster;
    // 房间号
    Global.roomId = systemInfo.roomId;
    // 游戏ID
    Global.gameId = systemInfo.gameId;
    // 系统版本
    Global.osVersion = systemInfo.osVersion;
    // 平台ios/android
    Global.os = systemInfo.platform;
    // 用户id
    Global.openId = systemInfo.openId;
    // 手机qq版本
    Global.QQVer = systemInfo.QQVer;
} else if (platform == CCConst.PLATFORM.VIVO) {
    let systemInfo = qg.getSystemInfoSync();
    // vivo平台的版本号 >=1031才能使用广告
    Global.apiVer = systemInfo.platformVersionCode;
    //是否支持视频广告组件基础库版本要求

} else if (platform == CCConst.PLATFORM.OPPO) {
    qg.getSystemInfo({
        success: function (res) {
            Global.apiVer = res.platformVersion;
        },
        fail: function (err) {
            Global.apiVer = 1031
        },
        complete: function (res) {
        }
    });

    //是否支持视频广告组件基础库版本要求
} else if (platform == CCConst.PLATFORM.BAIDU) {
    var systemInfo = swan.getSystemInfoSync();
    // API版本号
    Global.apiVer = systemInfo.SDKVersion;
    // 系统类型
    if (systemInfo.system.indexOf("iOS") !== -1) {
        Global.system = 1;
    } else {
        Global.system = 0;
    }
    //客户端版本号
    Global.version = systemInfo.version;
} else {
    Global.apiVer = '0';
    Global.system = 0;
    Global.version = '0';
}

Global.haveVideoBtn = (() => {
    if (platform == CCConst.PLATFORM.WEIXIN) {
        if (Global.apiVer >= '2.0.4') {
            return true;
        }
    } else if (platform == CCConst.PLATFORM.QQPLAY) {

    } else if (platform == CCConst.PLATFORM.QZONE) {

    } else if (platform == CCConst.PLATFORM.FACEBOOK) {

    } else if (platform == CCConst.PLATFORM.OPPO) {
        if (Global.apiVer >= 1040) {
            return true;
        }
    } else if (platform == CCConst.PLATFORM.VIVO) {
        if (Global.apiVer >= 1041) {
            return true;
        }
    } else if (platform == CCConst.PLATFORM.QQ) {
        return true;
    } else if (platform == CCConst.PLATFORM.TT) {
        return true;
    } else if (platform == CCConst.PLATFORM.BAIDU) {
        return true;
    } else if (platform == CCConst.PLATFORM.HUAWEI) {

    } else if (platform == CCConst.PLATFORM.QTT) {
        return true;
    }else if(platform == CCConst.PLATFORM.MGC){
        return true;
    }
})()
Global.setOwnProperty = function (property, val) {
    let canSet = ["multiKey", "multiData", "appInfo", "mainKey", "bucketTest"]
    if (canSet.indexOf(property) !== -1) {
        Object.defineProperty(Global, property, {
            value: val,
            writable: false,
            configurable: true,
            enumerable: true
        })
    }
};
Global.initOnlyRead = function () {
    let defineProperty = ['setOwnProperty', "api", 'platform', 'apiVer', 'system', 'version', 'isMaster', 'roomId', 'gameId', 'osVersion', 'os', 'openId', 'QQVer', 'haveVideoBtn']
    for (let i = 0; i < defineProperty.length; i++) {
        if (Global.hasOwnProperty(defineProperty[i])) {
            Object.defineProperty(Global, defineProperty[i], {
                writable: false,
                configurable: true,
                enumerable: true
            })
        }
    }
};
Global.initOnlyRead()
var outGlobal = {
    _Global: Global,
    get Global() {
        return this._Global
    },
    set Global(val) {

    }
}

module.exports = outGlobal.Global;