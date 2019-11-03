import Comm_ContronllerComponent from "../../myCommon/script/Comm_ContronllerComponent";
import Comm_Binder from "../../myCommon/script/Comm_Binder";
import FC_PlaneModel from "./FC_PlaneModel";
import { COMMAND_PLANE } from "./FC_Constant";
import Comm_Command from "../../myCommon/script/Comm_Command";
import { PlaneContronllerInit } from "./FC_Interface";
import Comm_Assets from "../../myCommon/script/Comm_Assets";
import Comm_Log from "../../myCommon/script/Comm_Log";

/**
 * 飞机控制类
 */
const {ccclass, property} = cc._decorator;

@ccclass
export default class FC_PlaneContronller extends Comm_ContronllerComponent {

    @property(cc.Sprite)
    planeSkinSprite: cc.Sprite = null;                  // 飞机皮肤
    @property(cc.Animation)
    planeAnim: cc.Animation = null;                 // 飞机坠落动画

    private _pool: cc.NodePool = null;                  // 对象池
    private _assetsInstance: Comm_Assets = null;        // 资源类实例

    public reuse(obj: PlaneContronllerInit){

        this._restores();

        this._pool = obj.pool;
        this._assetsInstance = Comm_Assets.getInstance();
        // 绑定
        Comm_Binder.getInstance().bindMC(obj.model, this);
        // 添加点击事件监听
        this.node.on(cc.Node.EventType.TOUCH_END, this._touchEnd, this);
    };

    public unuse(){

        this._restores();

        // 解绑
        Comm_Binder.getInstance().deleteMC(this);
        // 取消点击事件监听
        this.node.off(cc.Node.EventType.TOUCH_END, this._touchEnd, this);
    };

    // 回收
    public recircle(){
        this._pool.put(this.node);
    }

    // 还原
    private _restores(){
        this.node.scale = 1;
        this.node.stopAllActions();
        this._pool = null;
        this._assetsInstance = null;
        this.planeAnim.stop();
    };

    // 点击
    private _touchEnd(){

    }

    // 接收信息
    public receivedMessageByModel(command: Comm_Command){
        command.complete = true;
        if(!command.checkCommand(1)){
            Comm_Log.log('plane指令没有指定指令名');
        }
        switch(command.command){
            case COMMAND_PLANE.set_skin :
                this._setSkin(command);
            case COMMAND_PLANE.set_pos :
                this._setPos(command);
            case COMMAND_PLANE.play_anim:
                this._playAnim(command);
            case COMMAND_PLANE.move_to:
                this._moveTo(command);
        }
    };

    /**
     * 设置皮肤
     * @param command 
     */
    private _setSkin(command: Comm_Command){
        if(!command.checkCommand(2)){
            return;
        }
        let atlatsName: string = command.content.atlatsName;
        let skinName: string = command.content.skinName;
        if(!!atlatsName && !!skinName){
            let sp = this._assetsInstance.getSpriteFrameByAtlas(atlatsName, skinName);
            if(sp instanceof cc.SpriteFrame){
                this.planeSkinSprite.spriteFrame = sp;
            }else{
                Comm_Log.warn('未找到飞机皮肤');
            }
        }else{
            Comm_Log.warn('飞机换肤指令内容缺失');
        }
    };

    /**
     * 设置坐标位置
     * @param command 
     */
    private _setPos(command: Comm_Command){
        if(!command.checkCommand(2)){
            return;
        }
        let pos: cc.Vec2 = command.content.pos;
        let rotation: number = command.content.dir;
        if(pos instanceof cc.Vec2){
            this.node.setPosition(pos);
        }
        if(typeof rotation === 'number'){
            this.node.setRotation(rotation);
        }
    };

    /**
     * 播放动画
     * @param command 
     */
    private _playAnim(command: Comm_Command){
        if(!command.checkCommand(2)){
            return;
        }

        let animName: string = command.content;
        if(typeof animName === 'string'){
            this.planeAnim.play(animName);
        }else{
            Comm_Log.warn('plane动画播放指令参数错误');
        }
    };

    /**
     * 移动
     * @param command 
     */
    private _moveTo(command: Comm_Command){
        if(!command.checkCommand(2)){
            return;
        }

        let targetArr = command.content;
        if(Array.isArray(targetArr)){
            // this.node.runAction(cc.sequence(
            //     cc.moveTo(),
            // ));
        }else{
            Comm_Log.warn('plane移动指令参数错误');
        }
    };

    // 销毁
    public onDestroy(){
        if(cc.isValid(this.node)){
            this.node.off(cc.Node.EventType.TOUCH_END, this._touchEnd, this);
        }
        Comm_Binder.getInstance().deleteMC(this);
    }
}
