const CCGlobal = require('CCGlobal')
var AdsFunc = {
    bannerAd: null,
    videoAd: null,
    insertAd: null,
    netState: true,
    tableData: null,
    isInitNode: false,
    bannerNode: null,
    isNewNodeAd: false,
    BannerNodePos: null,
    cur_flag: 1,
    cur_bannerHeight: 0,
    isShowBanner: true,
    isChangeSize: false, //是否正在轮转
    isInCreateBanner: false, //是否正在创建
    isCenterBanner: false,
    isShowInsert: true,//是否显示插屏
    //判断网络状态
    getNetworkStatusChange: function () {
        if (CCGlobal != undefined && CCGlobal.platform == 1) {
            if (CCGlobal.apiVer >= "1.1.0") {
                wx.onNetworkStatusChange(res => {
                    console.log("net：" + res.isConnected);
                    this.netState = res.isConnected;
                })
                return this.netState;
            }
        }
    },

    initParms: function () {
        this.version = cc.ENGINE_VERSION;
        this.check_version = "1.10.0";
        this.systemInfo = wx.getSystemInfoSync();
        this.commonSize = cc.view.getFrameSize();
        this.totalSize = cc.view.getVisibleSize();
        //广告距离 游戏底部和设备底部的距离 iphoneX 50  其他20（暂时修改成 与iphonx的比例值）

        //默认dis_side = 30
        if (this.checkIphoneXDevice()) {
            this.dis_side = 30;
        } else {
            this.dis_side = 30 * (this.systemInfo.windowHeight / 812);
        }
    },

    initData: function () {
        //this.initParms();
        this.getNetworkStatusChange();
        this.tableData = window.GameConfig.adConfig;
    },
    changeDisSide: function (model) {
        if (!model) return;
        if (!model.disParm) return;
        this.dis_side = Number(model.disParm);
    },

    //创建 banner
    /*
        model: {
            key:  玩法对应key
            pos: 广告位
        }
        flag: 宽度比例
        isHide: 是否隐藏
        parm: {
            height: 高度
            width: 宽度
        }
    */
    createNewBanner: function (model, flag, isHide) {
        this.initParms();
        this.changeDisSide(model);

        this.setShowBanner(true);
        //统一接口  轮转广告
        if (model) {
            if (!model.isNotTurnAround) {
                if (this.bannerAd) {
                    this.showBanner();
                    //广告轮转
                    this.changeBanner(model, flag, isHide);
                    return;
                }
            }
        }

        // this.removeBanner();
        if (!model) return;
        if (!model.key || !model.pos) return;
        console.log("load bannerConfig");
        if (!this.tableData) {
            return;
        } else {
            this.createBannerAd(model, flag, isHide);
        }

    },

    createBannerAd: function (model, flag, isHide) {
        if (CCGlobal.platform != 1) return;
        if (CCGlobal.apiVer < "2.0.4") return;

        if (!this.netState) {
            if (!model.isNotTurnAround) {
                if (this.bannerAd) {
                    this.showBanner();
                    this.changeBannerPos();
                }
            }
            return;
        }

        if (!this.tableData) return;
        let object = this.tableData;
        let data = object[model.key];
        if (!data) return;
        let id;
        if (model.pos == "menubanner") {
            id = object[model.pos];
        } else {
            id = data[model.pos];
        }

        //如果 宽度在320或以下 高度在640或以下 使用另外一套id
        if (this.systemInfo.windowWidth <= 320 || this.systemInfo.windowHeight <= 640) {
            id = data["banner5"];
        }
        if (!id || id == 1) return;
        id = "adunit-" + id;
        console.log("banner id: ", id);

        this.bannerTime = Date.parse(new Date());
        wx.setStorage({key: "createBannerTime", data: this.bannerTime})
        //固定创建广告宽度：300（最小）
        let bannerAd = wx.createBannerAd({
            adUnitId: id,
            style: {
                left: 0,
                top: this.commonSize.height,
                width: 300,
            }
        })
        if (bannerAd) {
            bannerAd.onLoad(() => {
            });

            let showPromise = bannerAd.show();

            showPromise.then(() => {
                if (this.bannerAd) {
                    this.bannerAd.hide();
                    this.bannerAd.destroy();
                }
                this.bannerAd = bannerAd;
                this.isInCreateBanner = false;
                //是否需要显示广告
                if (!this.isShowBanner) {
                    this.hideBanner();
                }
                //是否是轮转
                if (this.isChangeSize) {
                    if (this.bannerAd) this.onResize(this.bannerAd, false);
                    this.isChangeSize = false;
                }
            }).catch(e => {
                console.log(e)
            });

            showPromise.catch(err => {
                if (bannerAd) {
                    bannerAd.hide();
                    bannerAd.destroy();
                }
                //是否需要显示广告
                if (!this.isShowBanner) {
                    this.hideBanner();
                    return;
                }
                if (this.bannerAd) {
                    this.showBanner();
                    this.isInCreateBanner = false;
                    this.isChangeSize = false;
                    //自动调整banner位置
                    // this.changeBannerPos();
                    this.onResize(this.bannerAd, false)
                }
            });

            this.firstResize = true;
            this.onResize(bannerAd, true);

            // bannerAd.onResize(res=>{
            //     this.cur_bannerHeight = res.height;
            //     if(!this.bannerNode) return;
            //     if(!res) return;
            //     //调整固定高度到 中间
            //     bannerAd.style.left += this.commonSize.width / 2 - (res.width / 2);
            //     let nodeSize = this.bannerNode.getContentSize();
            //     let ori_pos = this.bannerNode.position;
            //     this.bannerNode.position = cc.v2(ori_pos.x,ori_pos.y - nodeSize.height / 2);
            //     let pos = this.bannerNode.parent.convertToWorldSpaceAR(this.bannerNode);
            //     this.bannerNode.position = ori_pos;
            //     let h = (1 - (pos.y / this.totalSize.height)) * this.systemInfo.windowHeight;
            //     let dis_bottom = this.commonSize.height - h;
            //     //根据设备 留出banner到游戏界面和设备底部的距离
            //     let dest_bottom = dis_bottom - (2 * this.dis_side);
            //     let centern_pos = this.commonSize.height - (dis_bottom / 2);
            //     bannerAd.offResize();
            //     //顶部位置
            //     if(res.height >= dest_bottom){
            //         // bannerAd.style.top = this.commonSize.height - res.height - 5; 
            //         //固定中间 开发者根据自己游戏界面调整（banner不进行所缩放和移动位置）
            //         bannerAd.style.top = centern_pos - (res.height / 2);
            //         bannerAd.style.left = this.commonSize.width / 2 - (res.width / 2);
            //     }else{
            //         let dest_scale = dest_bottom / res.height;
            //         let dest_width = res.width * dest_scale;
            //         if(Number(dest_width) > Number(this.commonSize.width)){
            //             dest_width = this.commonSize.width;
            //             dest_scale = dest_width / 300;
            //         }
            //         let dest_height = res.height * dest_scale;
            //         bannerAd.style.left = this.commonSize.width / 2 - (dest_width / 2);
            //         bannerAd.style.top = centern_pos - (dest_height / 2);
            //         bannerAd.style.width = dest_width;
            //     }

            // });

            bannerAd.onError(() => {
                if (bannerAd) bannerAd.destroy();
                //是否需要显示广告
                if (!this.isShowBanner) {
                    this.hideBanner();
                    return;
                }
                this.showBanner();
                this.isInCreateBanner = false;
                this.isChangeSize = false;
                this.onResize(this.bannerAd, false)
            });
        }
    },

    onResize: function (bannerAd, isCreate) {
        if (!bannerAd) return;
        if (!cc.isValid(this.bannerNode)) return;
        console.log("onResize isCreate: ", isCreate);
        let flag = 1;
        // let pos = this.bannerNode.parent.convertToWorldSpaceAR(this.bannerNode);
        let nodeSize = this.bannerNode.getContentSize();
        let ori_pos = this.bannerNode.position;
        this.bannerNode.position = cc.v2(ori_pos.x, ori_pos.y - nodeSize.height / 2);
        let pos = this.bannerNode.parent.convertToWorldSpaceAR(this.bannerNode);
        this.bannerNode.position = ori_pos;
        let h = (1 - (pos.y / this.totalSize.height)) * this.systemInfo.windowHeight;
        let dis_bottom = this.commonSize.height - h;
        //根据设备 留出banner到游戏界面和设备底部的距离
        let dest_bottom = dis_bottom - (2 * this.dis_side);
        let centern_pos = this.commonSize.height - (dis_bottom / 2);

        console.log("dis_bottom: ", dis_bottom);
        console.log("dest_bottom: ", dest_bottom);
        console.log("centern_pos: ", centern_pos);

        if (isCreate) {
            bannerAd.offResize();
            console.log("onResize offResize: ");
            bannerAd.onResize(res => {
                console.log("bannerAd.onResize");
                console.log("this.firstResize: ", this.firstResize);

                if (!this.firstResize) {
                    bannerAd.offResize();
                } else {
                    this.cur_bannerHeight = res.height;
                    this.cur_bannerWidth = res.width;
                    //顶部位置
                    if (res.height >= dest_bottom) {
                        // bannerAd.style.top = this.commonSize.height - res.height - 5; 
                        //固定中间 开发者根据自己游戏界面调整（banner不进行所缩放和移动位置）
                        if (!this.isCenterBanner) {
                            bannerAd.style.top = h;
                        } else {
                            bannerAd.style.top = centern_pos - (res.height / 2);
                        }
                        bannerAd.style.left = this.commonSize.width / 2 - (res.width / 2);
                    } else {
                        let dest_scale = dest_bottom / res.height;
                        let dest_width = res.width * dest_scale;
                        if (Number(dest_width) > Number(this.commonSize.width)) {
                            dest_width = this.commonSize.width;
                            dest_scale = dest_width / 300;
                        }
                        let dest_height = res.height * dest_scale;
                        bannerAd.style.left = this.commonSize.width / 2 - (dest_width / 2);
                        if (!this.isCenterBanner) {
                            bannerAd.style.top = h;
                        } else {
                            bannerAd.style.top = centern_pos - (dest_height / 2);
                        }

                        bannerAd.style.width = dest_width;
                    }
                    this.firstResize = false;
                }
            });
        } else {
            bannerAd.offResize();
            if (this.isInCreateBanner) return;
            this.firstResize = true;
            console.log("this.cur_bannerHeight: ", this.cur_bannerHeight);
            console.log("this.cur_bannerWidth: ", this.cur_bannerWidth);
            let dest_width;
            let dest_height;
            //顶部位置
            if (this.cur_bannerHeight >= dest_bottom) {
                // bannerAd.style.top = this.commonSize.height - res.height - 5; 
                //固定中间 开发者根据自己游戏界面调整（banner不进行所缩放和移动位置）

                //还原到初始banner样式
                dest_width = this.cur_bannerWidth;
                dest_height = this.cur_bannerHeight;
                if (!this.isCenterBanner) {
                    bannerAd.style.top = h;
                } else {
                    bannerAd.style.top = centern_pos - (dest_height / 2);
                }
                bannerAd.style.left = this.commonSize.width / 2 - (dest_width / 2);
                bannerAd.style.width = dest_width;
            } else {
                let dest_scale = dest_bottom / this.cur_bannerHeight;
                dest_width = 300 * dest_scale;
                if (Number(dest_width) > Number(this.commonSize.width)) {
                    dest_width = this.commonSize.width;
                    dest_scale = dest_width / 300;
                }
                dest_height = this.cur_bannerHeight * dest_scale;
                bannerAd.style.left = this.commonSize.width / 2 - (dest_width / 2);
                if (!this.isCenterBanner) {
                    bannerAd.style.top = h;
                } else {
                    bannerAd.style.top = centern_pos - (dest_height / 2);
                }
                bannerAd.style.width = dest_width;
            }
            this.firstResize = false;
        }
    },


    setShowBanner: function (isBool) {
        this.isShowBanner = isBool;
    },

    showBanner: function () {
        this.setShowBanner(true);
        if (!this.bannerAd) return;
        this.bannerAd.show();
    },
    hideBanner: function () {
        this.setShowBanner(false);
        if (!this.bannerAd) return;
        this.bannerAd.hide();
    },
    removeBanner: function () {
        this.setShowBanner(false);
        if (!this.bannerAd) return;
        this.bannerAd.hide();
        this.bannerAd.destroy();
    },
    //model,flag,isHide
    changeBanner: function (model, scale, isHide) {
        //判定时间
        let cur_time;
        if (this.bannerAd) {
            cur_time = cc.sys.localStorage.getItem("createBannerTime");
            let now_time = Date.parse(new Date());
            let dis_time = now_time * 1 - cur_time;
            console.log("dis_time------------------: ", dis_time);
            if (dis_time < 90 * 1000) {
                this.showBanner();
                //调整广告位置
                // this.changeBannerPos();
                this.changeBannerSize();
                return;
            }
            this.hideBanner();
            this.setShowBanner(true);

            cur_time = new Date();
            this.bannerTime = Date.parse(new Date());
            wx.setStorage({key: "createBannerTime", data: this.bannerTime})
            this.createBannerAd(model, scale, isHide);
        } else {
            cur_time = new Date();
            this.bannerTime = Date.parse(new Date());
            wx.setStorage({key: "createBannerTime", data: this.bannerTime})
            this.createBannerAd(model, scale, isHide);
        }

    },
    /**
     *
     * @param {node} node  如果有预留界面，在createNewBanner之前，更新bannerNode
     */
    initBannerNode: function (node) {
        if (!node) return;
        this.isInitNode = true;
        this.bannerNode = node;
    },
    /**
     *
     * @param clearBannerNode 清理广告位 节点
     */
    clearBannerNode: function () {
        this.isInitNode = false;
        this.bannerNode = null;
    },
    /**
     *
     * @param {node} node  界面预留节点，即广告顶部 位置
     */
    changeBannerPos: function () {
        if (!this.bannerAd) return;
        if (!cc.isValid(this.bannerNode)) return;
        if (this.cur_bannerHeight == 0) return;
        //调整固定高度到 中间

        let nodeSize = this.bannerNode.getContentSize();
        let ori_pos = this.bannerNode.position;
        this.bannerNode.position = cc.v2(ori_pos.x, ori_pos.y - nodeSize.height / 2);
        let pos = this.bannerNode.parent.convertToWorldSpaceAR(this.bannerNode);
        this.bannerNode.position = ori_pos;

        let h = (1 - (pos.y / this.totalSize.height)) * this.systemInfo.windowHeight;
        let dis_bottom = this.commonSize.height - h;
        let centern_pos = this.commonSize.height - (dis_bottom / 2);
        if (!this.isCenterBanner) {
            this.bannerAd.style.top = h;
        } else {
            //顶部位置
            this.bannerAd.style.top = centern_pos - (this.cur_bannerHeight / 2);
            //如果预留广告位置小于 广告高度  banner贴设备底处理
            if (this.cur_bannerHeight >= dis_bottom) {
                this.bannerAd.style.top = this.commonSize.height - this.cur_bannerHeight - 5;
            }
        }
    },

    //兼容广告轮转  只改变当前banner的size
    changeBannerSize: function () {
        console.log("changeBannerSize---");
        //如果当前尺寸 一样  不做处理
        this.isChangeSize = true;
        if (this.isInCreateBanner) return;
        if (this.bannerAd) this.onResize(this.bannerAd, false);
    },


    //创建并返回 视频广告
    createNewVideoAd: function (model) {
        console.log("model:" + model);
        this.removeVideoAd();
        if (!model) return null;
        if (!model.key || !model.pos) return null;

        if (!this.tableData) {
            return;
        } else {
            return this.createRewardedVideoAd(model);
        }
    },

    createRewardedVideoAd: function (model) {
        if (!this.tableData) return;
        let object = this.tableData;
        let data = object[model.key];
        if (!data) return null;
        let id = data[model.pos];
        if (!id || id == 1) return null;
        id = "adunit-" + id;
        console.log("voide id: ", id);
        if (CCGlobal != undefined && CCGlobal.platform == 1) {
            if (CCGlobal.apiVer >= "2.0.4") {
                var videoAd = wx.createRewardedVideoAd({
                    adUnitId: id
                });
                this.videoAd = videoAd;
                return videoAd;
            }
        }
    },
    //拉取广告
    loadVideoAd: function (callbacks) {
        if (!this.netState) {
            wx.showToast({
                title: '网络状况不好，请稍后再试',
                icon: "none",
                duration: 1000,
            });
            let errMsg = {code: -1, msg: "没有网络 广告创建失败"};
            console.log(errMsg);
            if (callbacks.errCallback) {
                callbacks.errCallback(errMsg);
            }
            return;
        }
        if (this.videoAd) {
            this.errListen && this.videoAd.offError();
            this.errListen = (err) => {
                wx.showToast({
                    title: '视频正在赶来的路上，请稍后',
                    icon: "none",
                    duration: 2000,
                });
                let errMsg = {code: -2, msg: err};
                console.log(errMsg);
                if (callbacks.errCallback) {
                    callbacks.errCallback(errMsg);
                }
            };
            this.videoAd.onError(this.errListen);
            this.videoAd.load()
                .then(() => this.videoAd.show()).catch(e => {
                console.log(e)
            });
            this.closeVideo(callbacks);
        }
    },
    closeVideo: function (callbacks) {
        if (this.closeAdListen) this.videoAd.offClose(this.closeAdListen);
        this.closeAdListen = (res) => {
            if (res && res.isEnded || res === undefined) {
                if (callbacks.suCallback) {
                    callbacks.suCallback();
                }
            } else {
                if (callbacks.failCallback) {
                    callbacks.failCallback();
                }
            }
        }
        this.videoAd.onClose(this.closeAdListen);
    },
    removeVideoAd: function () {
        this.videoAd = null;
    },


    checkInsertAdAPI: function () {
        let cur_api = CCGlobal.apiVer;
        let check_api = "2.6.0";
        let cur_list = cur_api.toString().split(".");
        let check_list = check_api.split(".");

        let isGet = true;
        for (let i = 0; i < check_list.length; i++) {
            let i_check = check_list[i];
            let i_cur = cur_list[i];
            if (i_cur == undefined) continue;
            if (Number(i_cur) < Number(i_check)) {
                isGet = false;
            } else if (i_cur == i_check) {
                continue;
            } else {
                break;
            }
            if (i != check_list.length - 1) {
                if (!isGet) break;
            }
        }
        return isGet;
    },
    //插屏
    checkDisTime: function () {
        let cur_time = cc.sys.localStorage.getItem("createInsertAdTime");
        let now_time = Date.parse(new Date());
        if (!cur_time) {
            wx.setStorage({key: "createInsertAdTime", data: now_time});
            return true;
        }
        let dis_time = now_time * 1 - cur_time;
        if (dis_time < 30 * 1000) {
            // console.log()
            return false;
        } else {
            wx.setStorage({key: "createInsertAdTime", data: now_time});
        }
        return true;
    },
    createInsertAd(obj) {
        if (!this.checkInsertAdAPI()) return;
        if (!this.checkDisTime()) return;
        if (!this.isShowInsert) return;
        if (!this.tableData) return;
        let object = this.tableData;
        let id = object["insertId"];
        if (this.insertAd) {
            this.insertAds.show().then(() => {
                if (obj && obj.showCallback) {
                    obj.showCallback()
                }
            }).catch(e => {
                console.log(e)
            });
            return;
        }
        let insertAd = wx.createInterstitialAd({
            adUnitId: "adunit-" + id
        })
        this.loadFun && insertAd.offLoad();
        this.loadFun = () => {
            if (obj && obj.loadCallback) {
                obj.loadCallback()
            }
            console.log("插屏加载成功");
            this.insertAdLoad = true;
        }
        insertAd.onLoad(this.loadFun);
        this.errorFun && insertAd.offError();
        this.errorFun = (err) => {
            if (obj && obj.errCallback) {
                obj.errCallback()
            }
            console.log("广告显示错误", err);
        }
        insertAd.onError(this.errorFun);
        this.closeFun && insertAd.offClose();
        this.closeFun = () => {
            if (obj && obj.closeCallback) {
                obj.closeCallback()
            }
            console.log("插屏广告关闭");
            this.insertAd = null;
        }
        insertAd.onClose(this.closeFun);
        if (obj && obj.scene) {
            let cur_scene = cc.director.getScene().name;
            for (let i = 0; i < obj.scene.length; i++) {
                if (cur_scene == obj.scene[i]) {
                    return;
                }
            }
        }
        insertAd.show().then(() => {
            if (obj && obj.showCallback) {
                obj.showCallback()
            }
        }).catch(e => {
            console.log(e)
        });
    },
    setInsertAdVisible: function (bool) {
        this.isShowInsert = bool
    },
    //检测是否是iphoneX 相关机型
    checkIphoneXDevice: function () {
        if (CCGlobal != undefined && CCGlobal.platform == 1) {
            if (this.systemInfo.model && this.systemInfo.model.toString().indexOf("iPhone X") == "-1") {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    },
    clear: function () {
        if (this.bannerAd) {
            this.bannerAd.hide();
            this.bannerAd.destroy();
        }
        this.videoAd = null;
    },

};
module.exports = AdsFunc;