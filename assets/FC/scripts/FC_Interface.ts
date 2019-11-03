import FC_ChessPoint from "./FC_ChessPoint";
import FC_PlaneModel from "./FC_PlaneModel";

// 接口


// 棋手类型棋点 基本
export interface PlayerTypeChessPointBase {
    red: FC_ChessPoint,
    yellow: FC_ChessPoint,
    blue: FC_ChessPoint,
    green: FC_ChessPoint
};

// 棋手类型棋点 数组
export interface PlayerTypeChessPointArray {
    red: FC_ChessPoint[],
    yellow: FC_ChessPoint[],
    blue: FC_ChessPoint[],
    green: FC_ChessPoint[]
};

// 飞机控制器初始化
export interface PlaneContronllerInit {
    model: FC_PlaneModel,
    pool: cc.NodePool,
}