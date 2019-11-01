// toast element

const {ccclass, property} = cc._decorator;

@ccclass
export default class Comm_ToastEle extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    private _pool: cc.NodePool = null;

    public reuse(data){
        this.node.setPosition(data.pos);
        this.label.string = data.title;
        this._pool = data.pool;

        this.node.opacity = 0;
        this.node.runAction(cc.sequence(
            cc.fadeIn(0.1),
            cc.delayTime(1.5),
            cc.spawn(cc.moveBy(0.4, cc.v2(0, 100)), cc.fadeOut(0.4)),
            cc.callFunc(() => {
                this._reCircle();
            }),
        ));
    };

    public unuse(){
        this.label.string = '';
        this._pool = null;
        this.node.setPosition(cc.v2(0, 0));
        this.node.opacity = 0;
    };

    private _reCircle(){
        this._pool.put(this.node);
    };
}
