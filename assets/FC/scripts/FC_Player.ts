import { PLAYER_TYPE, PLANE_TYPE } from "./FC_Constant";
import FC_Plane from "./FC_Plane";

/**
 * 玩家类
 */
export default class FC_Player {
    public constructor() {

    };

    // 玩家名

    // 玩家头像

    // 

    // 玩家类型
    private _playerType: PLAYER_TYPE = null;
    // 飞机类型
    private _planeType: PLANE_TYPE = null;
    // 停驻的飞机
    private _planeStop: FC_Plane[] = null;
    // 等待的飞机
    private _planeWait: FC_Plane[] = null;
    // 飞行中的飞机
    private _planeFling: FC_Plane[] = null;
    // 到达终点的飞机
    private _planeFinish: FC_Plane[] = null;


}
