import { PLANE_TYPE, DIRECTION, COMMAND_PLANE } from "./FC_Constant";
import Comm_Model from "../../myCommon/script/Comm_Model";
import Comm_Command from "../../myCommon/script/Comm_Command";
import FC_ChessPoint from "./FC_ChessPoint";
import Comm_Log from "../../myCommon/script/Comm_Log";
import { CommFunc } from "../../myCommon/script/Comm_Modules";

/**
 * 飞机类模块
 */

export default class FC_PlaneModel extends Comm_Model {
    public constructor(type: PLANE_TYPE, index: number){
        super();
        this._type = type;
        this._index = index;
    };

    // 方向
    public static PLANE_DIRECTION = {
        UP: 0,
        DOWN: 180,
        LEFT: 270,
        RIGHT: 90,
    };
    public static PLANE_ATLATS_NAME = 'FC_Image';       // 飞机图集名
    public static PLANE_SKIN_NAME = {                   // 飞机皮肤名
        RED: 'plane_0_0',
        YELLOW: 'plane_1_0',
        BULE: 'plane_2_0',
        GREEN: 'plane_3_0',
        COMPLETE: 'plane_back'
    };
    // 下坠动画
    private static _FallAnimName = 'plane_fall';
    // 待机动画
    private static _StandbyAnimName = 'plane_standby';
    // 移动间隙时间
    private static _MoveTime = 0.5;

    private _type: PLANE_TYPE = null;           // 类型
    private _skinName: string = null;           // 皮肤名
    private _index: number = null;              // 序号
    private _position: cc.Vec2 = null;          // 位置
    private _direction: DIRECTION = null;       // 方向
    private _location: number = null;           // 在棋盘上的序号坐标
    private _inOuter: boolean = false;          // 在外环
    private _inInner: boolean = false;          // 在内环
    public inStopArea: Boolean = null;          // 在停驻区域
    public inWaitArea: Boolean = null;          // 在等待区域
    public inRoutes: Boolean = null;            // 在航线上
    public inEndArea: Boolean = null;           // 抵达终点
    public isMoving: Boolean = null;            // 是否在移动中(进入航线才有效)
    public hasFlying: Boolean = null;           // 有没有飞行过

    public get skinName(): string{
        return this._skinName;
    };
    public set skinName(name: string){
        this.skinName = name;
        let cod = CommFunc.getCommand([COMMAND_PLANE.set_skin], {atlatsName: FC_PlaneModel.PLANE_ATLATS_NAME, skiName: this._skinName});
        this.sendMessageToContronller(cod);
    };

    public get index(): number{
        return this._index;
    };

    public get position(): cc.Vec2{
        return this._position;
    };
    public set position(pos: cc.Vec2){
        this._position = pos;
        let cod = CommFunc.getCommand(COMMAND_PLANE.set_pos, this._position);
        this.sendMessageToContronller(cod);
    };

    public get direction(): DIRECTION{
        return this._direction;
    };
    public set direction(dir: DIRECTION){
        this._direction = dir;
        let cod: Comm_Command = null;
        let msg = [COMMAND_PLANE.set_rotation];
        if(this._direction === DIRECTION.UP){
            cod = CommFunc.getCommand(msg, FC_PlaneModel.PLANE_DIRECTION.UP);
        }else if(this._direction === DIRECTION.DOWN){
            cod = CommFunc.getCommand(msg, FC_PlaneModel.PLANE_DIRECTION.DOWN);
        }else if(this._direction === DIRECTION.LEFT){
            cod = CommFunc.getCommand(msg, FC_PlaneModel.PLANE_DIRECTION.LEFT);
        }else if(this._direction === DIRECTION.RIGHT){
            cod = CommFunc.getCommand(msg, FC_PlaneModel.PLANE_DIRECTION.RIGHT);
        }
        this.sendMessageToContronller(cod);
    }

    // 初始化
    public init(points: FC_ChessPoint){
        this.position = points.pos;
        this.direction = points.direction;
        this.inStopArea = true;
        this.inWaitArea = false;
        this.inRoutes = false;
        this.inEndArea = false;
        this.isMoving = false;
        this.hasFlying = false;

        this._inOuter = false;
        this._inInner = false;

        if(this._type === PLANE_TYPE.THE_RED){
            this._skinName = FC_PlaneModel.PLANE_SKIN_NAME.RED;
        }else if(this._type === PLANE_TYPE.THE_YELLOW){
            this._skinName = FC_PlaneModel.PLANE_SKIN_NAME.YELLOW;
        }else if(this._type === PLANE_TYPE.THE_BLUE){
            this._skinName = FC_PlaneModel.PLANE_SKIN_NAME.BULE;
        }else if(this._type === PLANE_TYPE.THE_GREEN){
            this._skinName = FC_PlaneModel.PLANE_SKIN_NAME.GREEN;
        }
    };

    // 播放等待动画
    public playStandbyAnim(){
        let cod_1 = CommFunc.getCommand([COMMAND_PLANE.play_anim], FC_PlaneModel._StandbyAnimName);
        this.sendMessageToContronller(cod_1);
        let cod_2 = CommFunc.getCommand([COMMAND_PLANE.allow_touch]);
        this.sendMessageToContronller(cod_2);
    };

    // 播放坠毁动画
    public playFallAnim(){
        let cod = CommFunc.getCommand([COMMAND_PLANE.play_anim], FC_PlaneModel._FallAnimName);
        this.sendMessageToContronller(cod);
    };

    // 进入等待区


    /**
     * 接收反馈
     * @param command 
     */
    public receivedMessageByContronller(command: Comm_Command){
        command.complete = true;
        if(!command.checkCommand(1)){
            Comm_Log.log(command.failError.msg);
        }
        switch(command.command){
            case COMMAND_PLANE.feedback_move_end:
                // 反馈移动结束

                ;
            case COMMAND_PLANE.feedback_be_touch:
                // 反馈被点击

                ;
            default:
                break;
        }
    };
}
