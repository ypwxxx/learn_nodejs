/**
 * 排行榜公共代码
 */

const CCConst = require('CCConst')
const CCGlobal = require('CCGlobal')
var WXGameClub = require('WXGameClub')
var AdsFunc = require('WXAdsFunc')
/**
 * 微信排行榜实现类
 */
var WXRanking = function () {
    this.inited = false;
    this.curKey = '';
};
var shareMsg
/**
 * 初始化排行榜
 * @param {*} games
 * @param {*} mainKey
 */
WXRanking.prototype.init = function (games, mainKey) {
    if (!this.inited) {

        let msg = new Object();
        msg.cmd = 'init';
        if (!games) {
            console.error("games is null");
            return;
        }
        if (games.length > 0)
            msg.games = games;
        else {
            console.log("games is invalid");
            return;
        }
        if (mainKey)
            msg.mainKey = mainKey;

        wx.postMessage({
            message: msg
        })

        //必须使用带shareTicket的分享
        wx.updateShareMenu({
            withShareTicket: true,
            success() {
            }
        });

        //检测群分享
        let self = this;
        wx.onShow(function (res) {
            console.log("start onShow==>");
            console.log(res);
            if (res.scene == 1044 && res.shareTicket && res.query && res.query.showGroupRanking == "1") { //1044是点击微信的小程序卡片的场景值
                //if(cc.director.getScene().name != G.startScene){
                self.hide();
                WXGameClub.destroyGameClubButton();
                AdsFunc.clear();
                cc.director.loadScene(G.startScene, function () {
                    setTimeout(function () {
                        console.log("start onShow emit")
                        cc.director.getScene().emit("CUSTOM_EVENT_SHOW_GROUP_RANKING", {
                            gameKey: res.query.gameKey,
                            shareTicket: res.shareTicket
                        });
                        //cc.game.emit("CUSTOM_EVENT_SHOW_GROUP_RANKING", {gameKey : res.query.gameKey, shareTicket: res.shareTicket});
                    }, 500);
                });
                //}else{
                //     console.log("start onShow emit")
                //    cc.director.getScene().emit("CUSTOM_EVENT_SHOW_GROUP_RANKING", {gameKey : res.query.gameKey, shareTicket: res.shareTicket});
                //}
            }
        })
        let launchOption = wx.getLaunchOptionsSync();
        console.log("start getLaunchOptionsSync==>");
        console.log(launchOption);
        if (launchOption.scene == 1044 && launchOption.shareTicket && launchOption.query && launchOption.query.showGroupRanking == "1") {
            setTimeout(function () {
                console.log("start launch emit")
                cc.director.getScene().emit("CUSTOM_EVENT_SHOW_GROUP_RANKING", {
                    gameKey: launchOption.query.gameKey,
                    shareTicket: launchOption.shareTicket
                });
            }, 500);
        }

        this.inited = true;
    }
}

/**
 * 展示全部好友排行
 * @param {*} key
 */
WXRanking.prototype.showFriendList = function (key) {
    let msg = {'key': key, 'cmd': 'showFriendList'}
    // 发消息给子域
    wx.postMessage({
        message: msg
    })
    this.curKey = key;
}

/**
 * 展示群排行
 * @param {*} key
 */
WXRanking.prototype.showGroupList = function (key, shareTicket) {
    let msg = {'key': key, 'shareTicket': shareTicket, 'cmd': 'showGroupList'}
    // 发消息给子域
    wx.postMessage({
        message: msg
    })
    this.curKey = key;
}
/**
 * 显示下一页
 */
WXRanking.prototype.nextPage = function () {
    let msg = {
        'cmd': 'nextPage'
    };
    wx.postMessage({
        message: msg
    })
}

/**
 * 显示上一页
 */
WXRanking.prototype.lastPage = function () {
    let msg = {
        'cmd': 'lastPage'
    };
    wx.postMessage({
        message: msg
    })
}

/**
 * 隐藏排行榜
 */
WXRanking.prototype.hide = function () {
    wx.postMessage({
        message: {'cmd': 'hide'}
    })
    this.curKey = '';
}

/**
 * 更新当前用户排行榜分数
 * @param {*} key
 * @param {*} record
 */
WXRanking.prototype.updateNewRecord = function (key, record) {
    let msg = {'cmd': 'newRecord', 'key': key, 'record': record}
    wx.postMessage({
        message: msg
    })
}

/**
 * 显示三人排行界面
 *
 */
WXRanking.prototype.showSimpList = function (key) {
    let msg = {'key': key, 'cmd': 'showSimpList'}
    // 发消息给子域
    wx.postMessage({
        message: msg
    })
    this.curKey = key;
}

/**
 * 从三人排行点到到全排行
 *
 */
WXRanking.prototype.showFriendListFromSimp = function () {
    let msg = {'key': this.curKey, 'cmd': 'showFriendListFromSimp'}
    // 发消息给子域
    wx.postMessage({
        message: msg
    })
}

/**
 *
 * 从结束界面的全体排行返回到三人排行界面
 */
WXRanking.prototype.showSimpListBackFromFriend = function () {
    let msg = {'key': this.curKey, 'cmd': 'showSimpListBackFromFriend'}
    // 发消息给子域
    wx.postMessage({
        message: msg
    })
}

/**
 * 显示即将超越下一个人
 * @param {string} key 玩法key
 * @param {number} score 当前得分
 * @param {number} posY 展示的 Y坐标位置，默认为0
 */
WXRanking.prototype.showPassNext = function (key, score, posY) {
    let msg = {'key': key, 'cmd': 'showPassNext', 'score': score, 'posY': posY ? posY : 0}
    // 发消息给子域
    wx.postMessage({
        message: msg
    })
}
WXRanking.prototype.initShare = function (data) {
    shareMsg = data
}
/**
 * 群分享
 */
WXRanking.prototype.groupShare = function (key) {
    let image, title
    for (let i = 0; i < shareMsg.length; i++) {
        if (key == shareMsg[i].name) {
            image = shareMsg[i].image;
            title = shareMsg[i].title;
        }
    }
    wx.shareAppMessage({
        title: title,
        imageUrl: image,
        query: "showGroupRanking=1&gameKey=" + key,
        success: function (res) {
            console.log('群排行分享 成功');
            console.log(res);

        },
        fail: function (res) {
            console.log('群排行分享 失败');
            console.log(res);
        }
    });
}

var instance = null;

var CCRanking = {
    getInstance: function () {
        if (!instance) {
            if (CCGlobal.platform == CCConst.PLATFORM.WEIXIN)
                instance = new WXRanking();
        }
        return instance;
    }
}

module.exports = CCRanking;