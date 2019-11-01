import { PLANE_TYPE } from "./FC_Constant";
import Comm_Model from "../../myCommon/script/Comm_Model";

/**
 * 飞机类模块
 */

export default class FC_PlaneModel extends Comm_Model {
    public constructor(){
        super();
    }

    private _type: PLANE_TYPE = null;       // 类型
    private _size: cc.Size = null;          // 大小
    public position: cc.Vec2 = null;        // 位置
    public direction: cc.Vec2 = null;       // 方向
    public inStopArea: Boolean = null;      // 在停驻区域
    public inWaitArea: Boolean = null;      // 在等待区域
    public inRoutes: Boolean = null;        // 在航线上
    public inEndArea: Boolean = null;       // 抵达终点
    public isMoving: Boolean = null;        // 是否在移动中(进入航线才有效)

    public receivedMessageByContronller(){
        
    }
}