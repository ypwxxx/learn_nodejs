const CCGlobal = require('CCGlobal')
const Stat = require('Statistics')

const GlobalInit = {
    hasInit: false,
    init: () => {
        if(!CCGlobal.platform) return;
        if (GlobalInit.hasInit) return;
        return new Promise((resolve) => {
                if (!window.GameConfig.info) return;
                GlobalInit.hasInit = true;
                let info = window.GameConfig.info;
                //整理配置信息
                let gameKeys = [], gameData = [];
                gameKeys.push({key: info.mainKey.name});
                gameData.push(info.mainKey);
                if (info.otherKey) {
                    for (let i = 0; i < info.otherKey.length; i++) {
                        gameKeys.push({key: info.otherKey[i].name});
                        gameData.push(info.otherKey[i]);
                    }
                }
                //初始化A/B测试
                if (info.bucketTest) {
                    let bucketTest = cc.sys.localStorage.getItem('bucketTest')
                    let char = []
                    for (let i = 0; i < Number(info.bucketTest); i++) {
                        char.push(String.fromCharCode(65 + i))
                    }
                    console.log(char)
                    let rand = Math.floor(Math.random() * (char.length))
                    let testChar = char[rand]
                    if (bucketTest) {
                        if (char.indexOf(bucketTest) > -1) {
                            CCGlobal.setOwnProperty("bucketTest", bucketTest)
                        } else {
                            CCGlobal.setOwnProperty("bucketTest", testChar)
                            cc.sys.localStorage.setItem('bucketTest', testChar)
                        }
                    } else {
                        CCGlobal.setOwnProperty("bucketTest", testChar)
                        cc.sys.localStorage.setItem('bucketTest', testChar)
                    }
                } else {
                    cc.sys.localStorage.removeItem('bucketTest')
                }

                //配置写入CCGlobal
                CCGlobal.setOwnProperty("appInfo", {
                    appId: info.appId,
                    sh: info.sh,
                    packageName:info.packageName,
                    appVer: info.appVer,
                    startScene: info.startScene,
                    screenInfo: info.info
                })
                if (info.mainKey) {
                    CCGlobal.setOwnProperty("mainKey", info.mainKey)
                }
                if (info.otherKey) {
                    CCGlobal.setOwnProperty("multiKey", gameKeys)
                    CCGlobal.setOwnProperty("multiData", gameData)
                }
                if (!info.appId || info.appId.length < 6) {
                    return -1
                }
                try {
                    if (info.statistics != "false") {
                        Stat.initModule(info.appVer, info.appId);
                    }
                } catch (e) {
                }
                resolve()
        })
    }
}
module.exports = GlobalInit;
(async () => {
    await GlobalInit.init()
})()