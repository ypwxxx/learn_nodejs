//writer-ml
let C_MultiPlatform = {

    SDK: null, //wx、qg、swan。。。
    ADS: null,
    isInitSDK : false,

    /* 
        vivo: 不同手机平台对应platform： 3和108
        oppo: 不同手机平台对应platform： 109和108

        vivo和oppo的判定 最好不要出现在一起

    */

    platform_id: -1,

    platform:{
        "WEIXIN": 104,
        "QQPlay": 105,
        "FB": 106,
        "BAIDU": 107,
        "VIVO": 108,
        "OPPO": 109,
        "TT": 110,
    },
    setPlatForm: function(sdk_name){
        let id;
        for(let i in this.platform){
            let i_id = this.platform[i];
            if(i == sdk_name){
                id = i_id;
                break;
            }
        }
        if(id){
            // cc.sys.platform = id;
            this.platform_id = id;
        }
    },
    config:{

        "IDS_StartScene": {
            "icon_gamecircle": ["WEIXIN"],
            "icon_share": ["WEIXIN"],
            "icon_rank_XX": ["WEIXIN"],
            "icon_rank_CC": ["WEIXIN"],
            "icon_right": ["WEIXIN"],
            "icon_yourlove": ["WEIXIN"],
            "node_load": ["WEIXIN"],
            "icon_APP": ["WEIXIN"],
            "node_tt": ["TT"],
        },

        "P_Sign": {
            "icon_sign": ["WEIXIN","BAIDU"],
            "icon_three": ["WEIXIN","BAIDU","TT"],
        },

        "P_Over": {
            "icon_box": ["WEIXIN","BAIDU","TT"],
            "icon_share": ["WEIXIN"],
            "icon_rank": ["WEIXIN"],
			"icon_APP": ["WEIXIN"],
        },

        "IDS_GameScene": {
            "icon_video":["WEIXIN","BAIDU","TT"],
            "icon_help": ["WEIXIN"],
        },

        "IDS_CCScene": {
            "icon_video":["WEIXIN","BAIDU","TT"],
            "icon_help": ["WEIXIN"],
        },

    },

    initPlatformSDK: function(){
        // qg.showToast({
        //     message: 'platform_id: ' + this.platform_id
        //   })
        switch (this.platform_id) {
            case 104:   //微信
                this.SDK = wx;
                this.ADS = require("WXAdsFunc");
                break;
            case 105:
                
                break;
            case 106:

                break;
            case 107:    //百度
                this.SDK = swan;
                break;
            case 108:     //vivo
                qg.showToast({
                    message: 'platform_id: 108'
                })
                this.SDK = qg;
                this.ADS = require("vivo_adsFunc");
                break;
            case 109:   //oppo
                this.SDK = qg;
                this.ADS = require("oppo_adsFunc");
                this.isInitSDK = true;
                break;
            case 110:
                this.SDK = tt;
                this.ADS = require("TT_ADS");
                break;
            case 8:

                break;
            default:

                break;
        }
    }, 

    getHasConfig: function(_key){
        if(!this.config[_key]) return false;
        return true;
    },

    checkPlatform: function(_key,_name){
        if(!this.config[_key]) return false;
        let self = this;
        let c = this.config[_key][_name].findIndex(function(value){
            return self.platform[value] == cc.sys.platform
        });
        return c == "-1" ? false : true;
    },

    initDataADS: function(){
        if(!this.ADS) return;
        if(!this.ADS.initData) return;
        this.ADS.initData();
    },

};

module.exports = C_MultiPlatform;
