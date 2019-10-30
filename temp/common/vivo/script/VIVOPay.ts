const Encoder = require('CCDBTURLCodec');
const CCGlobal = require('CCGlobal');
const CCComFun = require('CCComFun');
const URL = "http://192.168.10.144:8081"; //测试地址
const vivoUrl = "https://pay.vivo.com.cn/vivopay/order/request"; //VIVO支付地址

interface payParam {
    prodId: string,   //产品ID
    prodName: string,  //产品名称
    prodDesc: string, //产品叙述
    amount: number,   //金额 保留小数点后两位
    success: (res) => void, //支付成功回调.回调参数： {code:number 返回状态码,message:string 消息内容,result:string 支付结果}
    fail: (err) => void //支付失败回调.回调参数:{code: 错误码, msg: 失败信息}
    fixed:(res)=>void //复送回调,用于支付后道具没有发放进行补发的方法,最好不要传入与场景相关的代码 因为复送检查是在后台实时进行的.回调参数:{ orderNo: 订单号,prodId: 产品id,prodName: 产品名,amount: 产品金额}
}
interface fixParam {
    success:(res)=>void, //复送回调,用于支付后道具没有发放进行补发的方法,最好不要传入与场景相关的代码 因为复送检查是在后台实时进行的.回调参数:{ orderNo: 订单号,prodId: 产品id,prodName: 产品名,amount: 产品金额}
    fail: (err) => void //复送查询失败回调.回调参数:{code: 错误码, msg: 失败信息}
}
var timer = null;

var Pay = {
    payRequest: (obj: payParam) => {
        let self = this
        CCComFun.login({
            success: (data) => {
                var devData = qg.getSystemInfoSync();
                let info = {
                    appId: CCGlobal.appInfo.appId,
                    appVer: CCGlobal.appInfo.appVer,
                    pkg: CCGlobal.appInfo.packageName,
                    chnl: "VIVO",
                    model: devData.model,
                    os: "1",
                    osVer: devData.osVersionCode,
                    deviceId: "",
                    userId: data.openid,
                    lang: "Chinese",
                    prodId: obj.prodId,
                    prodName: obj.prodName,
                    currency: "CNY",
                    amount: obj.amount,
                    ext1: ""
                }
                //向公司服务器请求订单号
                qg.request({
                    url: URL + "/PayServer/pay/newVivoOrder.do",
                    header: {
                        'content-type': 'application/x-www-form-urlencoded'
                    },
                    method: "POST",
                    data: {ENCODE_DATA: Encoder.encode(JSON.stringify(info)), pver: "2.0"},
                    success: (res) => {
                        let orderData = res;
                        if (orderData.code == "0") {
                            //订单信息加密存在本地
                            let orderMsg = {
                                orderNo: orderData.orderNo,
                                prodId: obj.prodId,
                                prodName: obj.prodName,
                                amount: obj.amount,
                            }
                            //所有订单
                            let orderListStorage = cc.sys.localStorage.getItem("orderList");
                            let orderList = [];
                            if (orderListStorage) {
                                orderList = JSON.parse(this.aesDecrypt(orderListStorage));
                                orderList.push(orderMsg);
                            } else {
                                orderList.push(orderMsg);
                            }
                            let ciphertext = this.aesEncrypt(JSON.stringify(orderList));
                            cc.sys.localStorage.setItem("orderList", ciphertext);
                            //未确认订单
                            let ucfListStorage = cc.sys.localStorage.getItem("ucfOrder");
                            let ucfOrderList = [];
                            if (ucfListStorage) {
                                ucfOrderList = JSON.parse(this.aesDecrypt(ucfListStorage));
                                ucfOrderList.push(orderMsg);
                            } else {
                                ucfOrderList.push(orderMsg);
                            }
                            let cipherList = this.aesEncrypt(JSON.stringify(ucfOrderList));
                            cc.sys.localStorage.setItem("ucfOrder", cipherList);
                            let time = self.getReqTime();
                            let vivoInfo = {
                                signMethod: "MD5",
                                signature: `cpOrderNumber=${orderData.orderNo}&notifyUrl=${orderData.notifyUrl}&orderAmount=${obj.amount}&orderDesc=${obj.prodDesc}&orderTime=${time}&orderTitle=${obj.prodName}&packageName=${CCGlobal.appInfo.packageName}&version=1.0.0&${CCComFun.MD5Encrypt("").toLowerCase()}`.toLowerCase(),
                                version: "1.0.0",
                                packageName: CCGlobal.appInfo.packageName,
                                cpOrderNumber: orderData.orderNo,
                                notifyUrl: orderData.notifyUrl,
                                orderTime: time,
                                orderAmount: obj.amount,
                                orderTitle: obj.prodName,
                                orderDesc: obj.prodDesc,
                            }
                            //向VIVO服务器请求订单号
                            qg.request({
                                url: vivoUrl,
                                header: {
                                    'content-type': 'application/x-www-form-urlencoded'
                                },
                                method: "POST",
                                data: vivoInfo,
                                success: (res) => {
                                    if (res.respCode == 200) {
                                        //向VIVO发起支付
                                        qg.pay({
                                            orderInfo: JSON.stringify(res),
                                            success: (res) => {
                                                //上传赠送结果
                                                let sendInfo = {
                                                    appId: CCGlobal.appInfo.appId,
                                                    orderNo: orderData.orderNo,
                                                    status: 1,
                                                    finishDate: Date.now() - 28800000,
                                                    resMsg: ""
                                                }
                                                qg.request({
                                                    url: URL + "/PayServer/pay/upSendResultNew.do",
                                                    header: {
                                                        'content-type': 'application/x-www-form-urlencoded' // 默认值
                                                    },
                                                    method: "POST",
                                                    data: {
                                                        ENCODE_DATA: Encoder.encode(JSON.stringify(sendInfo)),
                                                        pver: "2.0"
                                                    },
                                                    success: () => {
                                                        //发放道具
                                                        obj.success && obj.success(res);
                                                    },
                                                    complete:()=>{
                                                        self.orderChecker({success:obj.fixed})
                                                    }
                                                })

                                            },
                                            fail: (error, code) => {
                                                let ret = {"code": code, "msg": "支付失败" + error};
                                                obj.fail && obj.fail(ret);
                                            }
                                        })
                                    }
                                },
                                fail: (error, code) => {
                                    let ret = {"code": code, "msg": "支付失败" + error};
                                    obj.fail && obj.fail(ret);
                                }
                            })
                        } else {
                            let ret = {"code": res.code, "msg": "支付失败" + res.msg};
                            obj.fail && obj.fail(ret);
                        }
                    },
                    fail: (error, code) => {
                        let ret = {"code": code, "msg": "支付失败" + error};
                        obj.fail && obj.fail(ret);
                    }
                })
            },
            fail: (err) => {
                obj.fail && obj.fail(err);
            }
        })
    },
    orderChecker: (obj) => {
        if(timer) {
            clearInterval(timer);
        }
        timer = setInterval(() => {
            let ufcOredr = cc.sys.localStorage.getItem("ucfListStorage");
            if (ufcOredr) {
                let oredrMsg = JSON.parse(this.aesDecrypt(ufcOredr));
                if (oredrMsg.length > 0) {
                    let localUserId = cc.sys.localStorage.getItem("vivoOpenId");
                    let fixMsg = {
                        appId: CCGlobal.appInfo.appId,
                        chnl: "VIVO",
                        pkg: CCGlobal.appInfo.packageName,
                        appVer: CCGlobal.appInfo.appVer,
                        deviceId: "",
                        userId: "",
                    }
                    var qryFixOrder = () => {
                        qg.request({
                            url: URL + "/PayServer/pay/qryFixOrder.do",
                            header: {
                                'content-type': 'application/x-www-form-urlencoded'
                            },
                            method: "POST",
                            data: {
                                ENCODE_DATA: Encoder.encode(JSON.stringify(fixMsg)),
                                pver: "1.0"
                            },
                            success: (res) => {
                                if (res.listFixOrder.length > 0) {
                                    for (let i = 0; i < res.listFixOrder.length; i++) {
                                        if (res.listFixOrder[i].action == 1) {
                                            oredrMsg.forEach((item, index, arr) => {
                                                if (item.orderNo == res.listFixOrder[i].orderNo) {
                                                    obj.success && obj.success(oredrMsg[index])
                                                }
                                            })

                                        }
                                    }
                                }
                                cc.sys.localStorage.removeItem("ucfListStorage");
                            },
                            fail: (error, code) => {
                                let ret = {"code": code, "msg": "复送查询失败" + error};
                                obj.fail && obj.fail(ret);
                            }
                        })
                    };
                    if (localUserId) {
                        fixMsg.userId = this.aesDecrypt(localUserId);
                        qryFixOrder()
                    } else {
                        CCComFun.login({
                            success: (res) => {
                                fixMsg.userId = res.accessToken;
                                qryFixOrder()
                            },
                            fail: (err) => {
                                obj.fail && obj.fail(err);
                            },
                        })
                    }
                }
            }
        }, 60000)
    },
    getReqTime: () => {
        let pad2 = (n) => {
            return n < 10 ? '0' + n : n
        }
        let date = new Date();
        let year = date.getFullYear().toString();
        let month = pad2(date.getMonth() + 1);
        let day = pad2(date.getDate());
        let hours = pad2(date.getHours());
        let minutes = pad2(date.getMinutes());
        let seconds = pad2(date.getSeconds());
        return year + month + day + hours + minutes + seconds;
    },
}

module.exports = Pay;