const CCGlobal = require('CCGlobal');
const CCConst = require('CCConst');
const CCComFun = require('CCComFun');
const GlobalInit = require('GlobalInit')
const Examin = require('Examin');
const WXShare = require('WXShare');
const Share = require('Share');

const WXInit = {
    init: async () => {
        await GlobalInit.init()
        //微信分享配置拉取
        CCComFun.getServCfg({
            appId:  CCGlobal.appInfo.appId,
            success: (res) => {
                try {
                    let data = JSON.parse(res.cfg.shareInfo);
                    for (let info in data) {
                        if (info != 'main') {
                            let multiData = CCGlobal.multiData.concat()
                            for (let i in multiData) {
                                if (multiData[i].name == info) {
                                    multiData[i].title = data[info][0].title
                                    multiData[i].image = data[info][0].imageUrl
                                }
                            }
                            CCGlobal.setOwnProperty("multiData", multiData)
                        }
                    }
                } catch {

                }
            },
            fail: (err) => {
                console.log(err);
            },
        });
        //初始化微信审核
        Examin.initMsg({appId: CCGlobal.appInfo.appId, sh: CCGlobal.appInfo.sh});
        WXShare.initMsg();
        Share.initMsg();
        /**
         * 微信更新提示
         **/
        const updateManager = wx.getUpdateManager()
        updateManager.onCheckForUpdate(function (res) {
        })
        updateManager.onUpdateReady(function () {
            wx.showModal({
                title: '更新提示',
                content: '多项优化重启后生效，是否马上重启小程序？',
                success: function (res) {
                    if (res.confirm) {
                        updateManager.applyUpdate();
                        console.log("success")
                    }
                }
            })
        })
    }
}

try {
    CCGlobal.platform == CCConst.PLATFORM.WEIXIN && WXInit.init();
} catch (e) {

}
