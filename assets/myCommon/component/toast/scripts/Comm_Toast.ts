/* *toast* */

const {ccclass, property} = cc._decorator;
import {NOTIFICATION} from "./../../../script/Comm_Modules";
import { COMM_EVENT } from "./../../../script/Comm_Enum";

@ccclass
export default class Toast extends cc.Component {

    @property(cc.Prefab)
    toastPrefab: cc.Prefab = null;

    private _toastPool: cc.NodePool = null;

    onLoad(): void{
        this._toastPool = new cc.NodePool('Comm_ToastEle');
        for(let i = 0; i < 5; i++){
            let temp = cc.instantiate(this.toastPrefab);
            this._toastPool.put(temp);
        }

        NOTIFICATION.on(COMM_EVENT.SHOW_TOAST, this._show, this);
    };

    /**
     * 显示toast
     * @param title 需要显示的内容
     */
    private _show(title: string): void{
        let data = {
            pos: cc.v2(0, 0),
            title: title,
            pool: this._toastPool,
        };
        this._createToastElement(data);
    };

    // 创建一个toast element
    private _createToastElement(data){
        if(this._toastPool.size() < 1){
            let temp = cc.instantiate(this.toastPrefab);
            this._toastPool.put(temp);
        }
        let toast = this._toastPool.get(data);
        this.node.addChild(toast);
    };

    onDestroy(){
        NOTIFICATION.off(COMM_EVENT.SHOW_TOAST, this._show, this);
    };
}
