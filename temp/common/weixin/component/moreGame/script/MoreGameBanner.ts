const WXMoreGameBanner = require('WXMoreGameCore');
const {ccclass, property} = cc._decorator;


@ccclass
export default class MoreGameBanner extends cc.Component {

    @property
    interface: string = "";
    @property(cc.Node)
    Node: cc.Node = null;
    @property(cc.ScrollView)
    View: cc.ScrollView = null;
    @property
    changeTime: number = 15;
    @property
    _time: number = 0;
    @property
    _iconNum: number = 0;

    public start() {
        this.MoreGameBanner();
        if (!WXMoreGameBanner.event) {
            cc.game.on(cc.game.EVENT_SHOW, () => {
                WXMoreGameBanner.event && WXMoreGameBanner.event.emit("skipSuccess");
            })
        }
    };

    private MoreGameBanner() {
        WXMoreGameBanner.GYLDataCtrl({
            node: this.Node,
            interface: (this.interface ? this.interface : 0)
        })
    };

    private update() {
        if (this.Node.width == 720) return;
        this._time += 1;
        if (this._time == 60 * this.changeTime) {
            this._time = 1;
            let Max = Math.ceil((this.Node.width - 720 - 15) / 155);
            let offset = Math.abs(Math.floor(this.View.getScrollOffset().x))
            let currentNum = Math.floor(offset / 155);
            if (this._iconNum > 0 && (offset > 155 * (Max - 1))) {
                this._iconNum = 0
            } else {
                this._iconNum = currentNum + 1
            }
            this.View.scrollToOffset(cc.v2(155 * this._iconNum, 0), 2);
        }
    }

}