import { PLANE_TYPE } from "./FC_Constant";
import Comm_Model from "../../myCommon/script/Comm_Model";

/**
 * 飞机类模块
 */

export default class FC_PlaneModel extends Comm_Model {
    public constructor(){
        super();
    };

    // 方向
    public static PLANE_DIRECTION = {
        UP: 0,
        DOWN: 180,
        LEFT: 270,
        RIGHT: 90,
    };
    public static PLANE_ATLATS_NAME = 'FC_Image';       // 飞机图集名
    public static PLAEN_SKIN_NAME = {                   // 飞机皮肤名
        RED: 'plane_0_0',
        YELLOW: 'plane_1_0',
        BULE: 'plane_2_0',
        GREEN: 'plane_3_0',
        COMPLETE: 'plane_back'
    };
    // 指令前缀
    private static _CommandPrefix = 'fc_plane_';
    // 下坠动画
    private static _FallAnimName = 'plane_fall';
    // 待机动画
    private static _StandbyAnimName = 'plane_standby';
    // 移动间隙时间
    private static _MoveTime = 0.5;

    private _type: PLANE_TYPE = null;       // 类型
    private _size: cc.Size = null;          // 大小
    public position: cc.Vec2 = null;        // 位置
    public direction: cc.Vec2 = null;       // 方向
    public inStopArea: Boolean = null;      // 在停驻区域
    public inWaitArea: Boolean = null;      // 在等待区域
    public inRoutes: Boolean = null;        // 在航线上
    public inEndArea: Boolean = null;       // 抵达终点
    public isMoving: Boolean = null;        // 是否在移动中(进入航线才有效)
    public hasFlying: Boolean = null;       // 有没有飞行过

    public receivedMessageByContronller(){
        
    }
}
