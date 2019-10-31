
/**
 * 飞机类
 */
const {ccclass, property} = cc._decorator;

@ccclass
export default class FC_Plane extends cc.Component {

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
