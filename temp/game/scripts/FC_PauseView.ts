const {ccclass, property} = cc._decorator;
const CST = require("FC_Constant");
const CF = require("FC_CommFun");
const FC_Msg = require("FC_Msg");
const Share = require("Share");
let Statistics = require("Statistics");

interface PauseData {
    pool: cc.NodePool,
    restartFunc: Function,
    helpCallback: Function,
};

@ccclass
export default class FC_PauseView extends cc.Component {

    @property(cc.Node)
    node_voice_close: cc.Node = null;
    @property(cc.Node)
    node_ad: cc.Node = null;

    private _pool: cc.NodePool = null;
    private _restartCallback: Function = null;
    private _helpCallback: Function = null;

    public reuse(obj: PauseData){
        this._pool = obj.pool;
        this._restartCallback = obj.restartFunc;
        this._helpCallback = obj.helpCallback;

        this.node.setContentSize(cc.winSize);
        this.node.setPosition(cc.v2(1000, 0));
        // 显示广告
        this._showBannerAd();
    };

    public unuse(){

    };

    public close(){
        this._pool.put(this.node);
    };

    public restart(){
        if( typeof this._restartCallback == 'function'){
            this._restartCallback();
        }
    };

    public home(){
        Statistics.reportEvent("playtime","FC","time");
        Statistics.reportEvent("overtime","FC","count");

        cc.director.preloadScene("FC_Menu", function () {
            setTimeout(function(){
                cc.director.loadScene("FC_Menu");
            },50)
        });
    };

    public help(){
        if( typeof this._helpCallback == 'function'){
            this._helpCallback();
        }
    };

    public voice(){

    };

    public share(){
        Share.shareGameMsg("FC");
    };

    private _showBannerAd(){
        let ad_pos;
        let ad_key;
        if(FC_Msg.gameType == CST.GAMETYPE.personToperson){
            ad_key = "FC_1"
            ad_pos = "banner2"
        }else{
            ad_key = "FC_2"
            ad_pos = "banner2"
        }

        CF.createBanner(this.node_ad,{key: ad_key,pos: ad_pos});
    };
}
