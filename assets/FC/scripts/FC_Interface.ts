import FC_ChessPoint from "./FC_ChessPoint";

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
}