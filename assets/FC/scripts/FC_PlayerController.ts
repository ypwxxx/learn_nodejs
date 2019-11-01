
/**
 * 玩家控制类
 * 负责玩家类的沟通,同步修改显示.
 */
const {ccclass, property} = cc._decorator;

@ccclass
export default class FC_PlayerController extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    // update (dt) {}
}
