const CCConst = require('CCConst');
const CCGlobal = require('CCGlobal');
const CCComFun = require('CCComFun');
const api = CCGlobal.api;
const URL = 'https://minigame.weplaybubble.com';

// const URL = 'http://192.168.10.9:8080'  //测试地址

interface parameter {
    duration: number;
    off: () => void;
    on: () => void;
};

interface main {
    switchState: number;
    firstUse: boolean;
    hasRequest: boolean;
    appId: string;
    sh: string;
    btnOrder: [string];
    isLimit: number;
    retryCount: number;
    initMsg: (obj) => void;
    getExamineMsg: (obj: parameter) => void;
    requestState: (obj: parameter, onlyRequest: boolean) => void;
    checkState: (off: () => void, on: () => void) => void;
    backCheckState: (off: () => void, on: () => void) => void;
    autoRequestExamin: (obj) => void;
    requestOrder: Function;
    getBtnOrder: Function;
    autoRequestOrder: Function;
};

var Examin: main = {
    switchState: null,
    firstUse: true,
    hasRequest: false,
    appId: null,
    sh: null,
    btnOrder: null,
    isLimit: -1, // 0:显示 1: 5分钟后显示 2:不显示 -1:未拉取
    retryCount: 0,
    initMsg: function (obj) {
        this.appId = obj.appId ? obj.appId : CCGlobal.appInfo.appId;
        this.sh = obj.sh ? obj.sh : CCGlobal.appInfo.sh;
    },
    getExamineMsg: function (obj: parameter) {
        if (!obj) {
            return -1;
        }
        if (!this.appId && !this.sh) {
            this.appId = CCGlobal.appInfo.appId ? CCGlobal.appInfo.appId : null;
            this.sh = CCGlobal.appInfo.sh ? CCGlobal.appInfo.sh : null;
        }
        let shState = localStorage.getItem(this.sh);
        if (shState == "0") {
            this.switchState = 0;
            this.hasRequest = true;
            obj.off && obj.off();
        } else {
            if (this.firstUse) {
                this.firstUse = false;
                setTimeout(() => {
                    api && api.showLoading({title: "加载中"});
                    let request = (obj) => {
                        try {
                            this.requestState(obj);
                            this.retryCount = 0;
                        } catch (err) {
                            if (this.retryCount < 5) {
                                this.retryCount += 1;
                                setTimeout(() => {
                                    request(obj);
                                }, 1000)
                            }
                        }
                    }
                    request(obj);
                    this.autoRequestExamin(obj);
                }, obj.duration)
            } else {
                this.backCheckState(obj.off, obj.on);
            }
        }
    },
    //拉取数据
    requestState: function (obj: parameter, onlyRequest: boolean) {
        if (!this.appId || this.appId.length < 6) {
            this.switchState = null;
            if (CCGlobal.platform == CCConst.PLATFORM.WEIXIN){
                api.setStorage({key:this.sh, data:"null"})
                api.setStorage({key:"switchState", data:"null"})
            }else{
                try {
                    api.setStorageSync(this.sh, "null");
                    api.setStorageSync("switchState", "null");
                } catch (e) {
                    localStorage.setItem(this.sh, "null");
                    localStorage.setItem("switchState", "null")
                }
            }
            onlyRequest || this.checkState(obj.off, obj.on);
            return -1;
        }
        let self = this;
        try {
            CCComFun.getServCfg({
                appId: self.appId,
                success: (res) => {
                    if (res.cfg[self.sh]) {
                        self.switchState = res.cfg[self.sh];
                        if (CCGlobal.platform == CCConst.PLATFORM.WEIXIN){
                            api.setStorage({key:this.sh, data:res.cfg[self.sh]})
                            api.setStorage({key:"switchState", data:res.cfg[self.sh]})
                        }else{
                            try {
                                api.setStorageSync(this.sh, res.cfg[self.sh]);
                                api.setStorageSync("switchState", res.cfg[self.sh]);
                            } catch (e) {
                                localStorage.setItem(this.sh, res.cfg[self.sh]);
                                localStorage.setItem("switchState", res.cfg[self.sh])
                            }
                        }
                    } else {
                        self.switchState = null;
                        if (CCGlobal.platform == CCConst.PLATFORM.WEIXIN){
                            api.setStorage({key:this.sh, data:"null"})
                            api.setStorage({key:"switchState", data:"null"})
                        }else{
                            try {
                                api.setStorageSync(this.sh, "null");
                                api.setStorageSync("switchState", "null");
                            } catch (e) {
                                localStorage.setItem(this.sh, "null");
                                localStorage.setItem("switchState", "null");
                            }
                        }
                    }
                    if (res.cfg.buttonOrder) {
                        res.cfg.buttonOrder.length > 0 && (self.btnOrder = res.cfg.buttonOrder)
                    }
                    onlyRequest || self.checkState(obj.off, obj.on);
                    this.hasRequest = true;
                },
                fail: () => {
                    self.switchState = null;
                    if (CCGlobal.platform == CCConst.PLATFORM.WEIXIN){
                        api.setStorage({key:this.sh, data:"null"})
                        api.setStorage({key:"switchState", data:"null"})
                    }else{
                        try {
                            api.setStorageSync(this.sh, "null");
                            api.setStorageSync("switchState", "null");
                        } catch (e) {
                            localStorage.setItem(this.sh, "null");
                            localStorage.setItem("switchState", "null")
                        }
                    }
                    onlyRequest || self.checkState(obj.off, obj.on)
                    this.hasRequest = true;
                },
            }, true)
        } catch (e) {
            self.switchState = null;
            if (CCGlobal.platform == CCConst.PLATFORM.WEIXIN){
                api.setStorage({key:this.sh, data:"null"})
                api.setStorage({key:"switchState", data:"null"})
            }else{
                try {
                    api.setStorageSync(this.sh, "null");
                    api.setStorageSync("switchState", "null");
                } catch (e) {
                    localStorage.setItem(this.sh, "null");
                    localStorage.setItem("switchState", "null")
                }
            }
            onlyRequest || self.checkState(obj.off, obj.on)
        }
    },
    //判断函数
    checkState: function (off, on) {
        if (this.switchState == 0) {
            off && off();
            try {
                api.hideLoading();
            } catch (e) {
            }
        } else if (this.switchState == 1) {
            on && on();
            try {
                api.hideLoading();
            } catch (e) {
            }
        } else {
            setTimeout(() => {
                if (this.switchState !== null) {
                    if (this.switchState == 0) {
                        off && off();
                    } else if (this.switchState == 1) {
                        on && on();
                    }
                } else {
                    let state = localStorage.getItem(this.sh);
                    if (state == "0") {
                        off && off();
                    } else {
                        on && on();
                    }

                }
                api && api.hideLoading()
            }, 3000)
        }
    },
    backCheckState: function (off, on) {
        if (this.switchState == 0) {
            off && off();
        } else if (this.switchState == 1) {
            on && on();
        } else {
            let state = localStorage.getItem(this.sh);
            if (state == "0") {
                off && off();
            } else {
                on && on();
            }
        }
    },
    //自动拉取审核参数
    autoRequestExamin: function (obj) {
        var timer = setInterval(() => {
            if (this.switchState == null) {
                this.requestState(obj, true)
            } else {
                clearInterval(timer);
            }
        }, 60000);
    },
    requestOrder: function (obj: Function, onlyRequest: boolean) {
        if (!this.appId || this.appId.length < 6) {
            return -1;
        }
        let self = this;
        try {
            CCComFun.getServCfg({
                appId: self.appId,
                success: (res) => {
                    if (res.cfg.buttonOrder) {
                        if (res.cfg.buttonOrder.length <= 0) return;
                        self.btnOrder = res.cfg.buttonOrder
                        onlyRequest || obj(self.btnOrder)
                    } else {
                        self.btnOrder = null;
                    }
                },
                fail: () => {
                    self.btnOrder = null;
                    self.autoRequestOrder(obj)
                },
            }, true)
        } catch (e) {
            this.btnOrder = null;
            this.autoRequestOrder(obj)
        }
    },
    getBtnOrder: function (obj: Function) {
        if (this.switchState == 0) {
            if (this.btnOrder) {
                obj(this.btnOrder)
            } else {
                this.requestOrder(obj)
            }
        }
    },
    //自动拉取按钮顺序
    autoRequestOrder: function (obj: Function) {
        var timer = setInterval(() => {
            if (!this.btnOrder) {
                this.requestOrder(obj, true)
            } else {
                clearInterval(timer);
            }
        }, 60000);
    },
    //拉取地区审核
    requestAreaExamin: function () {
        return new Promise((resolve, reject) => {
            //记录进入进入游戏时间;
            if (this.isLimit !== -1) {
                resolve();
                return;
            }
            cc.sys.localStorage.removeItem('recordEnterTime');
            if (CCGlobal.platform == CCConst.PLATFORM.WEIXIN){
                api.setStorage({key:"recordEnterTime", data:Date.now()})
            }else{
                cc.sys.localStorage.setItem('recordEnterTime', Date.now());
            }
            //获取不到参数的处理
            var failToGet = () => {
                let isAreaLimit = cc.sys.localStorage.getItem('isAreaLimit');
                if (isAreaLimit || isAreaLimit == 0) {
                    this.isLimit = isAreaLimit;
                } else {
                    this.isLimit = 1;
                }
            };
            var getState = () => {
                if (this.switchState == "0") {
                    CCComFun.getWxServConfig({
                        appId: this.appId,
                        success: res => {
                            if (res.cfg != undefined) {
                                let citySwitch = res.cfg.citySwitch;
                                if (citySwitch == 0) {
                                    this.isLimit = 0;
                                    resolve();
                                } else {
                                    let task = wx.request({//拉取是否限制地区的
                                        url: `${URL}/MiniGameServer/minigame/austatus.do`,
                                        success: (e) => {
                                            if (e.data.code == 0) {
                                                this.isLimit = 0;
                                            } else {
                                                this.isLimit = 1;
                                            }
                                            cc.sys.localStorage.setItem('isAreaLimit', e.data.code);
                                            resolve();
                                        },
                                        fail: () => {
                                            failToGet();
                                            resolve();
                                        }
                                    })
                                    setTimeout(() => {
                                        if (this.isLimit == -1) {
                                            task.abort()
                                            failToGet();
                                        }
                                        resolve();
                                    }, 3000)
                                }
                            } else {
                                //没有配开关直接不显示
                                this.isLimit = 2;
                                resolve();
                            }
                        },
                        fail: res => {
                            failToGet();
                            resolve();
                        }
                    });
                } else {
                    this.isLimit = 2;
                    resolve();
                }
            };
            var retryTime = 0;
            var setState = () => {
                if (this.hasRequest) {
                    console.log("this.hasRequest",this.hasRequest)
                    getState();
                } else {
                    if (retryTime < 5) {
                        retryTime = retryTime + 1;
                        console.log("retryTime_____________",retryTime)
                        setTimeout(() => {
                            setState();
                        }, 500)
                    }else{
                        resolve();
                    }
                }
            };
            setState();
            //开始拉取参数

        })
    },
    getAreaExamin: async function () {
        await this.requestAreaExamin();
        if (this.isLimit == 0) {
            return true;
        } else if (this.isLimit == 1) {
            let enter_time = cc.sys.localStorage.getItem('recordEnterTime');
            let now_time = Date.now();
            if (!enter_time) {
                cc.sys.localStorage.setItem('recordEnterTime', now_time);
                return false;
            } else {
                let dis_time = now_time - enter_time;
                if (dis_time < 300 * 1000) return false;
                //判断审核开关
                if (this.switchState == 0) return true;
                return false;
            }
        } else {
            return false;
        }
    },
}


module.exports = Examin;