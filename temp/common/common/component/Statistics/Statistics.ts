const Encoder = require('CCDBTURLCodec');
const genUUID = require('uuid');
const URL = 'https://event.stat.wedobest.com.cn';
// const URL = 'http://192.168.10.9:8080'  //测试地址
const CCGlobal = require('CCGlobal')
import store from './Stat_Store';
import {
    addCount,
    addTime,
    initDate,
    initLastData,
    stopTime,
    successUpload,
    updateCount,
    updateTime,
} from "./Stat_Action";

let StatStore; //Redux对象


enum dev {
    Android = 1,
    iOS,
    iPad
};

interface uploadObj {
    data: any,
    success?: Function,
    fail?: Function,
};

let interval: number = 60000; //上传间隔
let isUpload: boolean = false;   //是否初始化
let timer; //计时器
let reconnectTimes = 5; //重试次数

//api
let api = CCGlobal.api;

//平台
let platform = function () {
    let ifBucketTest = function (platform) {
        if (CCGlobal.bucketTest) {
            return platform + "-" + CCGlobal.bucketTest;
        } else {
            return platform;
        }
    }
    return ifBucketTest("OTHER");
};

//设备类型
let devType = (function () {
    if (cc.sys.os == "iOS") {
        try {
            let res = api.getSystemInfoSync()
            if (res.model.indexOf("iPad") != -1) {
                return "iPad";
            } else {
                return cc.sys.os;
            }
        } catch (e) {
            return cc.sys.os;
        }
    } else {
        return cc.sys.os;
    }
})();

//日期
let getDate = function () {
    let myDate = new Date();
    let year = myDate.getFullYear();
    let mouth = myDate.getMonth() + 1;
    let day = myDate.getDate();
    let check = (num) => {
        let res = num < 10 ? `0${num}` : num;
        return res;
    }
    return `${year}${check(mouth)}${check(day)}`
};
let systemInfo; //系统信息


//上传
let upload = (obj: uploadObj) => {
    //OPPO和小米不支持qg.request 华为仅支持原生ajax
    let isSupportApi = (() => {
        if (CCGlobal.platform == 5 || CCGlobal.platform == 11) {
            return 0;
        } else {
            return api
        }
    })();
    if (isSupportApi) {
        api.request({
            url: `${URL}/EventStatServ/report.do`,
            method: "POST",
            header: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: {ENCODE_DATA: obj.data, statVer: "2.0"},
            success: (res) => {
                obj.success && obj.success()
            },
            fail: (e) => {
                obj.fail && obj.fail()
            }
        })
    } else {
        var xmlHttp = new XMLHttpRequest();
        let method = 'post';
        let url = `${URL}/EventStatServ/report.do`;
        xmlHttp.open(method, url);
        xmlHttp.onreadystatechange = () => {
            if (xmlHttp.readyState == 4) {
                if (xmlHttp.status == 200) {
                    obj.success && obj.success()
                } else {
                    obj.fail && obj.fail()
                }
            }
        };
        xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xmlHttp.send(`ENCODE_DATA=${obj.data}&statVer=2.0`);
    }
};


var Stat = {
    initModule: (appVer: string, appId: string) => {

        //初始化设备信息和app信息
        let lastData = localStorage.getItem('LastData');
        let isInstalled = localStorage.getItem('switchState');
        let installVer = localStorage.getItem('installVer');
        //判断是否从未加入统计版本开始计算
        if (!installVer) {
            if (isInstalled || isInstalled == "0") {
                installVer = "0.0.1";
                localStorage.setItem('installVer', "0.0.1");
            } else {
                installVer = appVer;
                localStorage.setItem('installVer', appVer);
            }
        }
        //整合系统信息
        systemInfo = {
            appId: appId,
            chnl: platform(),
            installVer: installVer,
            appVer: appVer,
            pkg: " ",
            devType: dev[devType],
            osVer: cc.sys.osVersion.replace("_", "."),
        }
        //是否有未上传信息
        if (lastData) {
            store.dispatch(initLastData(JSON.parse(lastData)));
        }
        //留存统计

        let reportDays = (label: string) => {
            Stat.reportEventNow("user_days",label)
        }
        let firstDate = localStorage.getItem('firstDate');
        if (!firstDate) {
            let myDate = new Date();
            myDate.setHours(0);
            myDate.setMinutes(0);
            myDate.setSeconds(1);
            localStorage.setItem('firstDate', myDate.toString());
            reportDays(`day_1_start`);
        } else {
            let lastDate = new Date(firstDate);
            let nowDate = new Date();
            let lastDay = lastDate.getDate();
            let nowDay = nowDate.getDate();
            if (lastDay != nowDay) {
                let lastTimeStamp = lastDate.getTime();
                let nowTimeStamp = nowDate.getTime();
                let dayNum = Math.ceil((nowTimeStamp - lastTimeStamp) / 86400000);
                let startDays = localStorage.getItem('startDays');
                if (!startDays) {
                    if (dayNum > 1) {
                        localStorage.setItem('startDays', dayNum);
                        reportDays(`day_${dayNum}_start`);
                    }
                } else if (startDays != dayNum) {
                    localStorage.setItem('startDays', dayNum);
                    reportDays(`day_${dayNum}_start`);
                }
            }
        }

        //拉取在线配置
        // if(window.wx && wx.getSystemInfoSync){
        //     wx.request({
        //         url: `${URL}/OpsServ/query.do?umengId=${appId}&chnl=${platform}&pkg=0&appVer=${appVer}&devType=${dev[devType]}&osVer=${cc.sys.osVersion.replace("_",".")}&scVer=2`,
        //         method:"POST",
        //         success:(res)=>{
        //             console.log(res.data)
        //         },
        //         fail:(res)=>{
        //             interval=180000;
        //         }
        //     })
        // }else{
        //     fetch(`${URL}/OpsServ/query.do?umengId=${appId}&chnl=${platform}&pkg=0&appVer=${appVer}&devType=${dev[devType]}&osVer=${cc.sys.osVersion.replace("_",".")}&scVer=2`,{
        //         method: 'get',
        //         })
        //         .then(response => {
        //             if (response.ok) {
        //             return response.text()
        //             }
        //         })
        //         .then(data => {
        //             console.log(data)
        //         });
        // }

        //redux监听时间变化
        try {
            StatStore()
        } catch (e) {
        }
        let uploadData = () => {
            let failData = localStorage.getItem('FailData');
            let data = Object.assign({}, Object.assign({}, ...store.getState().data, {uuid: genUUID.create(1).toString()}), {
                data: [...store.getState().count.finish, ...store.getState().count.process]
            })
            if (data.data.length == 0) {
                return;
            }
            let res = Encoder.encode(JSON.stringify(data))
            upload({
                data: res,
                success: () => {
                    store.dispatch(successUpload())
                },
                fail: () => {
                    let data = []
                    if (failData) {
                        data = JSON.parse(failData)
                    }
                    data.push(res)
                    let stroage = JSON.stringify(data)
                    localStorage.setItem('FailData', stroage);
                },
            })
            //上传失败数据
            if (failData) {
                let need = JSON.parse(failData)
                for (let i = 0; i < need.length; i++) {
                    upload({
                        data: need[i],
                        success: () => {
                            localStorage.setItem('FailData', "");
                        },
                        fail: () => {
                            let data = []
                            if (failData) {
                                data = JSON.parse(failData)
                            }
                            data.push(res)
                            let stroage = JSON.stringify(data)
                            localStorage.setItem('FailData', stroage);
                        },
                    })
                }
            }
        }
        StatStore = store.subscribe(() => {
            let time = store.getState().count.second
            if (time !== 0 && time % 2000 == 0) {
                let originalData = JSON.stringify(store.getState().count)
                let data = JSON.parse(originalData)
                data.finish = [...data.finish, ...data.process]
                data.process = []
                let stroage = JSON.stringify(data)
                localStorage.setItem('LastData', stroage);
            }
            if (time !== 0 && time % interval == 0 && isUpload) {
                uploadData()
            }
        })
        if (api) {
            api.onHide(() => {
                try {
                    uploadData()
                } catch (e) {
                }
            })
        }
        //redux同步相关信息
        store.dispatch(initDate(systemInfo))
        //开始计时
        clearInterval(timer)
        timer = setInterval(() => {
            store.dispatch(updateTime())
        }, 100)

    },
    //type: time计时的 count计次的
    reportEvent: (event: string, label: string, type: string) => {
        isUpload = true;
        let date = getDate();
        let obj = {
            event: event,
            label: label,
            date: date
        }
        let state = store.getState()
        let exist = (list, event, label) => {
            let index
            let exists = false
            for (let i = 0; i < list.length; i++) {
                if (list[i].event == event && list[i].label == label) {
                    exists = true;
                    index = i
                    break;
                }
            }
            return {exists: exists, index: index}
        }
        if (type == "time") {
            let res = exist(state.count.process, event, label)
            if (res.exists) {
                store.dispatch(stopTime(res.index))
            } else {
                store.dispatch(addTime(obj))
            }
        }
        if (type == "count") {
            let res = exist(state.count.finish, event, label)
            if (res.exists) {
                store.dispatch(updateCount(res.index))
            } else {
                store.dispatch(addCount(obj))
            }
        }
    },
    reportEventNow: (event: string, label: string) => {
        let date = getDate();
        let obj = {
            event: event,
            label: label,
            date: date
        }
        let data = Object.assign({data: [obj], uuid: genUUID.create(1).toString()}, systemInfo);
        let res = Encoder.encode(JSON.stringify(data));
        upload({
            data: res,
            success: () => {
                reconnectTimes = 5
            },
            fail: () => {
                if (reconnectTimes) {
                    setTimeout(() => {
                        reconnectTimes -= 1
                        console.log(`第${5 - reconnectTimes}次重连`)
                        Stat.reportEventNow(event, label)
                    }, 1000)
                }
            }
        });
    }

};

module.exports = Stat


