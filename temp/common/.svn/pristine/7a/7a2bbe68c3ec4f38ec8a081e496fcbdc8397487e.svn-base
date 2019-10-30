/**
 * 通用分享(微信/字节/手q)
 * 说明: 通用公用分享,功能: 调用普通分享,调用奖励分享.
 * 作者： 丁冬琴 ---2019/4/10, 余鹏为 ---2019/4/13
 * 版本信息:
 * @version 1.0.0 初始版本,支持自定title以及imageUrl的普通分享以及奖励分享. 丁冬琴更新
 *
 * @version 1.0.1 2019/4/13更新, 添加从远程拉取分享文案以及imageUrl功能,支持以key值
 * 来使用远程分享信息进行普通分享和奖励分享.默认初始化后,会自动将游戏内置的右上角分享绑定主玩法的远程分享信息.余鹏为更新
 *
 * @version 1.0.2 2019/4/15更新, 支持奖励分享时,传入suData或者failData,作为分享成功或者失败后,传入成功/失败回调的参数.
 *
 * @version 1.0.3 2019/4/17更新, 添加方法: onWXSystemShare: (key)=>void 通过传入的key来更换右上角系统分享的分享内容,
 * 不传参数,则更换为主玩法的分享内容.另外对部分方法的说明进行了小幅修改和补充.
 * 
 * @version 1.0.4 2019/4/25更新, 添加获取分享信息时的,如果组件暂时尚未拉渠道服务器信息,则返回一个含有错误code以及错误msg的回执
 * 
 * @version 1.0.5 2019/5/9更新.
 * 1.完善错误返回的信息,现在调用onWXSystemShare, getShareInfo, shareGameMsg方法时, 如果出现错误会返回一个负数错误码.
 * 2.优化shareGameMsg方法, 现在支持,在传入的参数中,如果即传入了key,也传入了title和imageUrl, 那么当key值获取的远程信息出现错误时
 * 则使用传入的分享信息进行分享.
 * 
 * @version 1.0.6 2019/5/21更新
 * 1.完善onWXSystemShare方法在分享信息未拿到时的逻辑.
 * 
 * @version 1.0.7 2019/5/22更新
 * 1.增加远程请求失败后,重复请求数据
 * 2.当远程信息未获取到时, 增加再次获取远程数据的逻辑.
 * 
 * @version 1.0.8 2019/6/12更新
 * 1.增加分享时对场景的判断,如果分享回调时的场景不是调用分享时的场景,则不再进行后续操作.
 * 2.取消try catch, 增加拉取的信息错误的判断, 并在错误的时候进行重连.
 * 
 * @version 1.0.9 2019/6/14更新
 * 1.增加对获取的字符串,去除制表/回车/退格符号的操作.
 * 2.添加读取本地信息的逻辑,当无法获取到服务器信息时,使用本地分享信息(前提配置好本地的分享信息).
 * 
 * @version 1.1.0 2019/8/1更新
 * 1.增加分享审核参数,true可使用分享,false不可使用.
 * 2.如果分享审核参数为false,且调用分享时传入了失败回调,那么会调起失败回调,并传入参数({code: -7, msg: '无法获取广告,请稍候再试!'}).
 * 3.无论有没有失败回调,都会返回值为-7的错误码.
 * 4.添加对审核参数的识别,在分享时,会判断是否允许分享(分享审核),然后会再判断审核开关,审核关时才允许使用激励分享.
 * 
 * @version 1.1.1 2019/8/1更新
 * 1.添加分享审核的实时获取方式,但是目前依然使用非实时获取.
 * 2.去掉失败会返回-7的错误码,添加errCallback的错误返回回调.(需要的话,在suCallback/failCallback参数中,再添加一个errCallback的方法即可).
 * 
 * @version 1.1.2 2019/8/1更新
 * 1.紧急修复一个会导致不回调失败的bug.
 * 
 * @version 1.1.3 2019/8/21更新
 * 1.更新为通用分享,支持微信/字节/手q.
 * 2.删除部分不会被使用的多余属性及变量.
 * 
 * @version 1.1.4 2019/8/27更新
 * 1.添加对shareSh属性的访问.
 * 2.更改errCallback回调的形式,在传入了错误回调时,不再进行默认的toast的显示.
 * 3.讲解: 成功回调: 成功分享后的逻辑; 失败回调: 分享失败后的逻辑; 错误回调: 不能执行分享的环境下的逻辑.
 * 
 * @version 1.1.5 2019/8/28更新
 * 1.添加参数isAds,在调用分享时,设置该参数为false, 即可使用不受审核参数/分享参数控制的,带奖励普通分享.
 * 
 * @version 1.1.6 2019/8/28更新
 * 1.错误回调现在在视频分享错误的情况下,会自动展示错误提示
 * 2.调用奖励分享时,如果没有传入错误回调,则会使用失败回调替代.
 * 
 * @version 1.1.7 2019/8/29更新
 * 1.修改sh和shareSh规则判断的优先级,目前以sh优先级为先.
 * 
 * @version 1.1.8 2019/9/23更新
 * 1.增加百度平台的分享
 *
 * 可供调用方法:
 * ---- initMsg: () => void 初始化远程信息,以及添加游戏内置分享监听
 * ---- getShareInfo: (key: string) => {title, imageUrl} 传入key值,返回远程分享信息
 * ---- shareGameMsg: (any) => void 传入参数, 主动调用分享(具体参数内容见方法的注释).
 * ---- onWXSystemShare: (key: string) => void 更换监听系统分享的分享内容.
 */
const CCGlobal = require('CCGlobal');
const CCConst = require('CCConst');
const CCComFun = require('CCComFun');
const Examin = require('Examin');

interface ShareParam {
    key?: string,               // 指定的玩法key
    title?: string,
    imageUrl?: string,
    suCallback?: Function,      // 分享成功回调
    failCallback?: Function,    // 分享失败回调
    errCallback?: Function,     // 分享出错回调
    regularTime?: number,
    suData?: any,
    failData?: any,
    isAds?: boolean,
};

interface ShareInfo {
    title: string,
    imageUrl: string,
};
interface ShareInfoInterface{
    main?: any;
    [key: string]: ShareInfo[];
};
interface ErrorMsg {
    code: number,
    msg: string,
};
interface RemoteCallbacks {
    success?: Function,
    fail?: Function,
};

const ErrorArr = [
    {code: -1, msg: '组件暂未获取到分享信息!'},
    {code: -2, msg: '组件未获取到远程分享信息,同时传入参数中也没有自定义的分享信息供选择!'},
    {code: -3, msg: 'WXShare模块的 onWXSystemShare 中的key值传入错误!key不在分享信息中!'},
    {code: -4, msg: '获取分享信息需要填入玩法key值!'},
    {code: -5, msg: '获取分享信息的Key值错误!'},
    {code: -6, msg: '使用分享方法时,传入的参数错误!'},
    {code: -7, msg: '无法获取广告,请稍候再试!'},
];

class Share {
    private constructor() {};
    private static instance: Share = null;

    public static getInstance(): Share {
        this.instance = this.instance || new Share();
        return this.instance;
    };
    public static RE_CONNECT_TIMES = 3;         // 重连次数

    protected isShareShow:boolean = false;   //避免熄屏后重开屏幕，会调用前后台监听
    protected sharing: Function = null;     // 回到前台后调用的方法
    protected api:any = null;                      //记录当前平台使用api。

    private _shareInfo: ShareInfoInterface = null;         // 分享信息
    private _rotaryTag: any = null;             // 轮转的标签
    private _curSysShareKey: string = null;     // 记录当前系统分享的key值
    private _reConnectTimes: number = Share.RE_CONNECT_TIMES;        // 重连次数
    private _curShareSceneName: string = null;      // 记录当前的场景名
    private _isServerData: boolean = null;          // 标记是否是服务器数据
    private _shareSH: boolean = true;              // 是否分享的审核标志   true分享false不分享

    // 返回shareSH的具体值
    public get shareSH(){
        let sh = this._shareSH ? 0 : 1;
        return sh;
    };

    /**
     * 初始化信息(从服务器获取)
     * @method initMsg
     * @for Share
     */
    public initMsg(){
        this._requestShareInfo(this.onSystemShare.bind(this));
        this._isServerData = false;

        if(CCGlobal.platform == CCConst.PLATFORM.WEIXIN){
            this.api = window.wx;
        }else if(CCGlobal.platform == CCConst.PLATFORM.QQ){
            this.api = window.qq;
        }else if(CCGlobal.platform == CCConst.PLATFORM.TT){
            this.api = window.tt;
        }else if(CCGlobal.platform == CCConst.PLATFORM.BAIDU){
            this.api = window.swan;
        }else{
            return;
        }
        this.api.showShareMenu({
            withShareTicket:true,
            success:()=>{
                this.onSystemShare();
            }
        });
    };

    /**
     * 添加右上角系统转发的监听
     * @param key 需要更换的玩法key
     */
    public onSystemShare(key?: string): number{
        if(this._shareInfo === null){
            this._requestShareInfo(this.onSystemShare.bind(this));
            console.warn(ErrorArr[0].msg);
            return ErrorArr[0].code;
        }
        if(typeof key !== 'string'){
            key = this._shareInfo.main;
        }
        if(this._shareInfo === null){
            console.warn(ErrorArr[0].msg);
            return ErrorArr[0].code;
        }
        if(!this._shareInfo.hasOwnProperty(key)){
            console.warn(ErrorArr[2].msg);
            return ErrorArr[2].code;
        }


        this._curSysShareKey = key;
        this.api.offShareAppMessage();
        this.api.onShareAppMessage(this._onShareMsg.bind(this));
    }

    private _onShareMsg(){
        let info: ShareInfo = this.getShareInfo(this._curSysShareKey) as ShareInfo;
        console.log("info.title",info.title,"imageUrl",info.imageUrl)
        return {
            title: info.title,
            imageUrl: info.imageUrl,
        }
    };

    /**
     * 获取分享信息
     * @method getShareInfo
     * @for Share
     * @param {String} key 指定获取信息的游戏key
     * @return {ShareInfo} 返回指定key值的分享信息
     * @example
     * let info = Share.getShareInfo('key');
     * let title = info.title;
     * let imageUrl = info.imageUrl;
     */
    public getShareInfo(key: string): ShareInfo | number{
        if(!key){
            console.warn(ErrorArr[3].msg);
            return ErrorArr[3].code;
        }
        if(this._shareInfo === null){
            this._requestShareInfo();
            console.warn(ErrorArr[0].msg);
            return ErrorArr[0].code;
        }
        if(!this._shareInfo.hasOwnProperty(key)){
            console.warn(`获取分享信息的Key值错误!错误key: ${key},不在信息:${this._shareInfo}中`);
            return ErrorArr[4].code;
        }
        let keyInfo = this._shareInfo[key];
        let info = keyInfo[this._rotaryTag[key]];
        this._rotaryTag[key]++;
        if(this._rotaryTag[key] >= this._shareInfo[key].length){
            this._rotaryTag[key] = 0;
        }
        console.log("getShareInfo",info)
        return info;
    };

    // 从服务器获取share信息
    private _requestShareInfo(callFunc: Function = null){
        this._useLocalData();
        if(this._isServerData) return;
        let success = (res) => {
            // console.log('CCGlobal: ', CCGlobal);
            if(res && res.cfg && res.cfg.shareInfo){
                // 记录下服务器的分享审核标志
                if(typeof res.cfg.shareSH !== 'undefined'){
                    this._shareSH = Number(res.cfg.shareSH) == 0 ? true : false;
                }
                console.log(`服务器分享审核标志: ${res.cfg.shareSH}, shareSH: ${this._shareSH}`);

                let info = res.cfg.shareInfo;
                if(typeof info === 'string' && info.indexOf('main') !== -1 && info.indexOf('title') !== -1 && info.indexOf('imageUrl') !== -1){
                    this._reConnectTimes = 0;
                    info = info.replace(/[\r\n\t]/g, '');
                    let data: ShareInfoInterface = JSON.parse(info);
                    this._isServerData = true;

                    console.log('分享信息:', data);

                    this._shareInfo = data;
                    // 初始化轮转标签
                    let obj = {};
                    for(let info in data){
                        if(info != 'main'){
                            obj[info] = 0;
                        }
                    }
                    this._rotaryTag = obj;
                    // 调用回调方法
                    if(callFunc && typeof callFunc === 'function'){
                        callFunc();
                    }
                }else{
                    this._reconnect(callFunc);
                }

            }else{
                console.log('服务器数据中没有分享信息!请联系阿菲进行设置!');
            }

        };
        let fail = (err) => {
            console.log(err);
            this._reconnect(callFunc);
        };

        this._getRemoteConfig({success: success, fail: fail});
    };

    /**
     * 返回一个处于出入两个数字区间内的随机数字(前后参数顺序不强调大小)
     * @method caculateTimeSlot
     * @for Share
     * @param {Number} num1 任意数字1
     * @param {Number} num2 任意数字2
     * @return {Number} 一个随机数字
     * @example
     * let randNum1 = Share.caculateTimeSlot(10, 2);  // ok
     * let randNum2 = Share.caculateTimeSlot(2, 10);  // ok
     */
    public caculateTimeSlot(num1: number, num2: number): number {
        let max = Math.max(num1, num2);
        let min = Math.min(num1, num2);
        let range = max * 1 - min;
        let rand = Math.random();
        let num = min * 1 + Math.round(rand * range); //四舍五入
        return num;
    };

    /**
     * -------shareGameMsg, 游戏分享, 可单独传入一个key值进行普通分享,也可以传入对应参数的对象分享
     * @method shareGameMsg
     * @for Share
     * @param {String} key 单独传入一个key字符串,即使用从服务器获取的title和imageUrl进行普通分享.
     * @param {ShareParam} obj 1.传入{title, imageUrl}, 使用传入参数提供的title和url进行普通分享.
     * @param {ShareParam} obj 2.传入{key, suCallback, failCallback, regularTime?, suData?, failData?}, 使用服务器提供的信息进行带有奖励回调的分享,regularTime为固定数值的奖励回调时间,
     * 不传使用随机时间段.regularTime单位秒.suData为分享成功回调可能会用到的数据, failData为分享失败可能会用到的数据.
     * @param {ShareParam} obj 3.传入{title, imageUrl, suCallback, failCallback, regularTime?, suData?, failData?},使用传入参数提供的信息进行带有奖励回调的分享,regularTime为固定数值的
     * 奖励回调时间,不传使用随机时间段.suData为分享成功回调可能会用到的数据, failData为分享失败可能会用到的数据.
     * @example
     * // 方式1 (普通分享)
     * Share.shareGameMsg('key');     //用key值进行普通分享
     * Share.shareGameMsg({title: 'abcsde...', imageUrl: 'https//....'});         // 用自定的信息进行普通分享
     * // 方式2 (带奖励的分享,随机值)
     * Share.shareGameMsg({key: 'key', suCallback: function(){}, failCallback: function(){}, suData: anyData, failData: anyData});
     * Share.shareGameMsg({title: 'abcsde...', imageUrl: 'https//....', suCallback: function(){}, failCallback: function(){}, suData: anyData, failData: anyData});
     * // 方式3 (带奖励的分享,固定值)
     * Share.shareGameMsg({key: 'key', suCallback: function(){}, failCallback: function(){}, regularTime: 2, suData: anyData, failData: anyData});
     * Share.shareGameMsg({title: 'abcsde...', imageUrl: 'https//....', suCallback: function(){}, failCallback: function(){}, regularTime: 2, suData: anyData, failData: anyData});
     */
    public shareGameMsg(key: string): void;
    public shareGameMsg(obj: ShareParam): void;
    public shareGameMsg(obj: any):void | number {
        if (this.api != null) {
            let title: string = null;
            let imageUrl: string = null;
            let hasReward: boolean = null;      // 是否带有奖励
            let isAds: boolean = null;          // 是否为视频奖励
            let errCallback: Function = typeof obj.errCallback == 'function' ? obj.errCallback: obj.failCallback;

            if(typeof obj === 'string'){
                if(typeof this._shareInfo !== 'undefined'){
                    let info: ShareInfo | number = this.getShareInfo(obj);
                    if(typeof info === 'number'){
                        return info;
                    }else{
                        title = info.title,
                        imageUrl = info.imageUrl;
                    }
                }else{
                    this._requestShareInfo(this.shareGameMsg.bind(this, obj));
                    console.warn(ErrorArr[0].msg);
                    return ErrorArr[0].code;
                }

                hasReward = false;
                isAds = false;

            }else if(typeof obj === 'object'){
                if(typeof obj.title === 'string' && typeof obj.imageUrl === 'string'){
                    title = obj.title,
                    imageUrl = obj.imageUrl;
                }
                if(typeof obj.key === 'string'){
                    if(typeof this._shareInfo !== 'undefined'){
                        let info: ShareInfo | number = this.getShareInfo(obj.key);
                        if(typeof info === 'number'){
                            if(title === null || imageUrl === null){
                                this._errBack(info, errCallback);
                                return info;
                            }
                        }else{
                            title = info.title,
                            imageUrl = info.imageUrl;
                        }
                    }else{
                        if(title === null || imageUrl === null){
                            this._requestShareInfo(this.shareGameMsg.bind(this, obj));
                            console.warn(ErrorArr[1].msg);
                            this._errBack(1, errCallback);
                            return ErrorArr[1].code;
                        }
                    }
                }

                hasReward = (!!obj.suCallback || !!obj.failCallback);
                isAds = typeof obj.isAds == 'boolean' ? obj.isAds : true;
            }else{
                console.warn(`使用分享方法时,传入的参数错误! 错误参数: ${obj}`);
                this._errBack(5, errCallback);
                return ErrorArr[5].code;
            }

            if(hasReward){
                // 带奖励分享
                if(isAds){
                    // 视频类型
                    let rewardShare = () => {
                        if(Examin.switchState == 0){
                            // 审核关闭
                            if(this._shareSH){
                                // shareSh == 0
                                this._curShareSceneName = cc.director.getScene().name;
                                console.log(`记录当前场景名: ${this._curShareSceneName}`);
                                
                                this._share(title, imageUrl);
                                this.show(obj.suCallback, obj.failCallback, obj.suData, obj.failData, obj.regularTime);
                            }else{
                                // shareSh == 1
                                this._errBack(6, errCallback, true, isAds);
                            }
                        }else if(Examin.switchState == 1){
                            // 审核开启
                            this._errBack(6, errCallback, true, isAds);
                        }
                    };
    
                    this._getShareConfig(rewardShare);
                }else{
                    // 普通类型
                    let rewardShare = () => {
                        this._curShareSceneName = cc.director.getScene().name;
                        console.log(`记录当前场景名: ${this._curShareSceneName}`);

                        this._share(title, imageUrl);
                        this.show(obj.suCallback, obj.failCallback, obj.suData, obj.failData, obj.regularTime);
                    };
    
                    this._getShareConfig(rewardShare);
                }
            }else{
                // 普通无奖励分享
                this._share(title, imageUrl);
            }
        }
    };

    //前后台监听--分享成功与否
    public show (suCallback: Function, failCallback: Function, suData: any = null, failData: any = null, regularTime: number) {
        let time1 = Date.now();
        let isShareShow = true;

        if (this.api != null) {
            this.sharing = ()=> {

                // 判断是否是当前场景,不是则取消监听,并退出
                let sceneName = cc.director.getScene().name;
                if(this._curShareSceneName !== sceneName){
                    console.log(`回调场景改变,取消分享回调, scene name: ${sceneName}`);
                    this.offShare();
                    return;
                }
                
                if (isShareShow) {
                    isShareShow = false;
                    let time2 = Date.now();
                    let curTime = time2 - time1;
                    if (!regularTime) {
                        let minTime = this.caculateTimeSlot(2, 4) * 1000;
                        let maxTime = this.caculateTimeSlot(7, 10) * 1000;
                        console.log('minTime:',minTime, " maxTime:",maxTime, 'curTime', curTime);
                        if (curTime >= minTime && curTime <= maxTime) {
                            if (suCallback) {
                                suCallback(suData);
                            }
                        } else {
                            if (failCallback) {
                                if(this.api != null){
                                    this.api.showToast({
                                        title: '分享失败，请不要重复分享到同一个群哦!!',
                                        icon: "none",
                                        duration: 2000,
                                    });
                                }
                                failCallback(failData);
                            }
                        }
                    } else {
                        let reguTime = regularTime * 1000;
                        if (curTime >= reguTime) {
                            if (suCallback) {
                                suCallback(suData);
                            }
                        } else {
                            if (failCallback) {
                                if(this.api != null){
                                    this.api.showToast({
                                        title: '分享失败，请不要重复分享到同一个群哦!!',
                                        icon: "none",
                                        duration: 2000,
                                    });
                                }
                                failCallback(failData);
                            }
                        }
                    }
                    this.offShare();
                }
            }
            this.offShare();
            this.api.onShow(this.sharing);
        }
    };

    //场景销毁的时候调用
    public offShare() {
        try {
            if(this.sharing){
                this.api.offShow(this.sharing);
            }
        } catch (error) {
        }
    };

    // 分享
    private _share(title: string, imageUrl: string){
        if(this.api != null){
            this.api.shareAppMessage({
                title: title,
                imageUrl: imageUrl,
                success: function (res) {
                    console.log('拉起分享 成功');
                    console.log(res);
                },
                fail: function (res) {
                    console.log('拉起分享 失败');
                    console.log(res);
                }
            });
        }
    };

    // 失败回调
    private _errBack(errIndex: number, errCallback: Function, isShowToast: boolean = false, isAds: boolean = false){
        if(this.api != null){
            if(isShowToast){
                let msg = '';
                if(isAds){
                    msg = ErrorArr[6].msg;
                }else{
                    // 预留其他可能

                }
                this.api.showToast({
                    title: msg,
                    icon: "none",
                    duration: 2000,
                });
            }
        }

        if(typeof errCallback == 'function'){
            errCallback(ErrorArr[6]);
        }
    };

    // 重连
    private _reconnect(callFunc: Function = null){
        if(this._reConnectTimes > 0){
            this._reConnectTimes--;
            console.log(`WXShare重连第${Share.RE_CONNECT_TIMES - this._reConnectTimes}次`);
            let time = setTimeout(() => {
                this._requestShareInfo(callFunc);
                clearTimeout(time);
            }, 1000);
        }
    };

    // 获取远程分享参数
    private _getShareConfig(rewardShare: Function){
        let success = (res) => {
            if(res && res.cfg){
                // 记录下服务器的分享审核标志
                if(typeof res.cfg.shareSH !== 'undefined'){
                    this._shareSH = Number(res.cfg.shareSH) == 0 ? true : false;
                }
                console.log(`服务器分享审核标志: ${res.cfg.shareSH}, shareSH: ${this._shareSH}`);
            }

            if(typeof rewardShare == 'function'){
                rewardShare();
            }
        };
        let fail = (err) => {
            console.log(`拉取服务器参数失败,使用本地默认值.shareSH: ${this._shareSH}`);
            if(typeof rewardShare == 'function'){
                rewardShare();
            }
        };
        this._getRemoteConfig({success: success, fail: fail});
    };

    // 获取远程参数配置
    private _getRemoteConfig(options: RemoteCallbacks, realTime: boolean = false){
        CCComFun.getServCfg({
            appId: CCGlobal.appInfo.appId,
            success: (res) => {
                if(typeof options.success == 'function'){
                    options.success(res);
                }
            },
            fail: (err) => {
                if(typeof options.fail == 'function'){
                    options.fail(err);
                }
            },
        }, realTime);
    };

    // 使用本地数据
    private _useLocalData(){
        if(CCGlobal && CCGlobal.mainKey && CCGlobal.multiData){
            console.log(CCGlobal.multiData)
            if(!this._isServerData && this._shareInfo) return;
            if(this._shareInfo === null){
                this._shareInfo = {};
            }
            this._shareInfo.main = CCGlobal.mainKey.name;
            for(let i in CCGlobal.multiData){
                let data = CCGlobal.multiData[i];
                this._shareInfo[data.name] = [{
                    title: data.title,
                    imageUrl: data.image
                }];
            }

            // 初始化轮转标签
            let obj = {};
            for(let info in this._shareInfo){
                if(info != 'main'){
                    obj[info] = 0;
                }
            }
            this._rotaryTag = obj;

            console.log('本地数据: ', this._shareInfo);
        }
    };
}

let instance = Share.getInstance();

module.exports = instance;



