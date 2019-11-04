import FC_ChessPoint from "./FC_ChessPoint";
import { PlayerTypeChessPointArray, PlayerTypeChessPointBase, PlaneChesserObject } from "./FC_Interface";
import { DIRECTION, COLOR, PLANE_TYPE } from "./FC_Constant";
import FC_GameData from "./FC_GameData";
import FC_PlaneModel from "./FC_PlaneModel";

/**
 * 棋盘类模块
 */

export default class FC_Chess {
    private constructor() {
        this._pointOutArr = [];
        this._pointInArr = {
            red: [],
            yellow: [],
            blue: [],
            green: [],
        };
        this._planeWaitArr = {
            red: null,
            yellow: null,
            blue: null,
            green: null,
        };
        this._planeStopArr = {
            red: [],
            yellow: [],
            blue: [],
            green: [],
        };
    };
    private static instance: FC_Chess = null;
    public static getInstance(): FC_Chess{
        this.instance = this.instance || new FC_Chess();
        return this.instance;
    }
    
    // 棋盘外环棋点的坐标数组(以蓝色的起飞点起始)
    private static _ChessPointOutPosArr: cc.Vec2[] = [
        cc.v2(129, 300),cc.v2(152, 257),cc.v2(152, 214),cc.v2(129, 170),
        cc.v2(172, 129),cc.v2(213, 146),cc.v2(256, 146),cc.v2(299, 129),
        cc.v2(319, 86),cc.v2(320, 43),cc.v2(318, -1),cc.v2(320, -44),
        cc.v2(320, -85),cc.v2(301, -128),cc.v2(259, -148),cc.v2(216, -149),
        cc.v2(175, -126),cc.v2(127, -168),cc.v2(152, -210),cc.v2(152, -254),
        cc.v2(129, -296),cc.v2(89, -323),cc.v2(47, -323),cc.v2(5, -323),
        cc.v2(-40, -323),cc.v2(-82, -323),cc.v2(-124, -297),cc.v2(-146, -257),
        cc.v2(-146, -214),cc.v2(-124, -169),cc.v2(-167, -126),cc.v2(-209, -149),
        cc.v2(-253, -149),cc.v2(-294, -128),cc.v2(-316, -89),cc.v2(-316, -46),
        cc.v2(-318, -2),cc.v2(-317, 42),cc.v2(-316, 83),cc.v2(-297, 126),
        cc.v2(-256, 146),cc.v2(-212, 146),cc.v2(-168, 127),cc.v2(-125, 170),
        cc.v2(-146, 212),cc.v2(-146, 255),cc.v2(-127, 298),cc.v2(-85, 317),
        cc.v2(-43, 316),cc.v2(1, 316),cc.v2(44, 316),cc.v2(87, 316)
    ];
    // 棋盘外环方向(以蓝色开始点起始)(开始-结束-方向)
    private static _ChessPointOutDirArr: Number[][] = [
        [0, 2, DIRECTION.DOWN],[3, 6, DIRECTION.RIGHT],
        [7, 12, DIRECTION.DOWN],[13, 15, DIRECTION.LEFT],
        [16, 19, DIRECTION.DOWN],[20, 25, DIRECTION.LEFT],
        [26, 28, DIRECTION.UP],[29, 32, DIRECTION.LEFT],
        [33, 38, DIRECTION.UP],[39, 41, DIRECTION.RIGHT],
        [42, 45, DIRECTION.UP],[46, 51, DIRECTION.RIGHT],
    ]
    // 棋盘内环棋点的坐标数组(红色开始)
    private static _ChessPointInPosArr: cc.Vec2[][] = [
        [cc.v2(4, -255),cc.v2(4, -213),cc.v2(4, -171),cc.v2(4, -130),cc.v2(4, -88),cc.v2(4, -41)],
        [cc.v2(-253, -2),cc.v2(-211, -2),cc.v2(-168, -2),cc.v2(-126, -2),cc.v2(-85, -2),cc.v2(-36, -2)],
        [cc.v2(4, 254),cc.v2(4, 212),cc.v2(4, 171),cc.v2(4, 129),cc.v2(4, 88),cc.v2(4, 43)],
        [cc.v2(258, -1),cc.v2(217, -1),cc.v2(174, -1),cc.v2(133, -1),cc.v2(91, -1),cc.v2(47, -1)]
    ];
    // 棋盘内环方向(红色开始)
    private static _ChessPointInDirArr: DIRECTION[] = [
        DIRECTION.UP, DIRECTION.RIGHT, DIRECTION.DOWN, DIRECTION.LEFT
    ];
    // 各方飞机停驻点的坐标(红色开始)
    private static _ChessPointPlaneStopPosArr: cc.Vec2[][] = [
        [cc.v2(-304, -252),cc.v2(-247, -252),cc.v2(-304, -305),cc.v2(-247, -305)],
        [cc.v2(-304, 302),cc.v2(-247, 302),cc.v2(-304, 249),cc.v2(-247, 249)],
        [cc.v2(250, 302),cc.v2(305, 302),cc.v2(250, 249),cc.v2(305, 249)],
        [cc.v2(250, -252),cc.v2(305, -252),cc.v2(250, -305),cc.v2(305, -305)]
    ];
    // 各方飞机待机点的坐标(红色开始)
    private static _ChessPointPlaneWaitPosArr: cc.Vec2[] = [
        cc.v2(-169, -338),cc.v2(-340, -170),cc.v2(-173, -338),cc.v2(-340, -173)
    ];
    // 各方飞机待机点(同停驻区域)方向
    private static _ChessPointPlaneWaitDirArr: DIRECTION[] = [
        DIRECTION.UP, DIRECTION.RIGHT, DIRECTION.DOWN, DIRECTION.LEFT
    ];
    // 各方飞机内环切入点序号(红色开始)
    private static _ChessPointPlaneToInIndexArr: Number[] = [
        23,36,49,10
    ];
    // 各方飞机起飞点序号(红色开始)
    private static _ChessPointPlaneStartIndexArr: Number[] = [
        26,39,0,13
    ];
    // 各方飞机飞棋点序号(红色开始)(开始[0]-结束[1]-方向)
    private static _ChessPointPlaneFlyIndexArr: Number[][] = [
        [43, 3, DIRECTION.RIGHT],
        [4, 16, DIRECTION.DOWN],
        [17, 29, DIRECTION.LEFT],
        [30, 42, DIRECTION.UP]
    ];
    // 各方飞机内环与飞行线交叉点及颜色(红色开始))(序号-颜色)
    private static _ChessPointPlaneInCrossFlyLineIndexArr: Number[][] = [
        [2, COLOR.BLUE],
        [2, COLOR.GREEN],
        [2, COLOR.RED],
        [2, COLOR.YELLOW],
    ];

    // 外环棋点数组(以蓝色开始点起始)
    private _pointOutArr: FC_ChessPoint[] = null;
    // 内环棋点数组(红色开始)
    private _pointInArr: PlayerTypeChessPointArray = null;
    // 飞机待机点数组(红色开始)
    private _planeWaitArr: PlayerTypeChessPointBase = null;
    // 飞机停驻点数组(红色开始)
    private _planeStopArr: PlayerTypeChessPointArray = null;

    // 初始化
    public init(){
        // 初始化外环
        this._initOuterRing();
        // 初始化内环
        this._initInnerRing();
        // 初始化待机点
        this._initWaitPoints();
        // 初始化停驻点
        this._initStopPoints();
    };

    /**
     * 获取停驻点
     * @param type 类型
     * @param index 序号
     */
    public getStopPoint(type: PLANE_TYPE, index: number){
        let result: FC_ChessPoint = null;
        if(type === PLANE_TYPE.THE_RED){
            result = this._planeStopArr.red[index];
        }else if(type === PLANE_TYPE.THE_YELLOW){
            result = this._planeStopArr.yellow[index];
        }else if(type === PLANE_TYPE.THE_BLUE){
            result = this._planeStopArr.blue[index];
        }else if(type === PLANE_TYPE.THE_GREEN){
            result = this._planeStopArr.green[index];
        }
        return result;
    };

    /**
     * 获取待机点
     * @param type 类型
     */
    public getWaitPoint(type: PLANE_TYPE){
        let result: FC_ChessPoint = null;
        if(type === PLANE_TYPE.THE_RED){
            result = this._planeWaitArr.red;
        }else if(type === PLANE_TYPE.THE_YELLOW){
            result = this._planeWaitArr.yellow;
        }else if(type === PLANE_TYPE.THE_BLUE){
            result = this._planeWaitArr.blue;
        }else if(type === PLANE_TYPE.THE_GREEN){
            result = this._planeWaitArr.green;
        }
        return result;
    };

    /**
     * 初始化外环
     */
    private _initOuterRing(){
        for(let i = 0; i < FC_Chess._ChessPointOutPosArr.length; i++){
            let p = FC_Chess._ChessPointOutPosArr[i];       // 坐标
            let dir = this._getOutPointDirection(i);        // 方向
            let color = this._getOutPointColor(i);          // 颜色
            let point = new FC_ChessPoint(i);               // new一个point
            point.pos = p;
            point.direction = dir;
            point.color = color;
            point.isOuterRing = true;               // 外环
            if(this._checkIsStartFlyPoint(i)){
                // 判断是起飞点
                point.isStartPoint = true;
            }
            if(this._checkIsCutInPoint(i)){
                // 判断是切入点
                point.isCutPoint = true;
            }
            // 判断是否是飞行点
            this._checkIsFlyPoint(point);
            this._pointOutArr.push(point);
        }
    };

    /**
     * 初始化内环
     */
    private _initInnerRing(){
        for(let i = 0; i < FC_Chess._ChessPointInPosArr.length; i++){
            let temp = FC_Chess._ChessPointInPosArr[i];
            let dir = FC_Chess._ChessPointInDirArr[i];      // 方向
            let color = this._getInnerPointColor(i);        // 颜色
            for(let j = 0; j < temp.length; j++){
                let p = temp[j];                            // 坐标
                let point = new FC_ChessPoint(j);
                point.pos = p;
                point.direction = dir;
                point.color = color;
                point.isInnerRing = true;           // 内环
                if(j == 5){
                    // 终点
                    point.isEndPoint = true;
                }
                // 检查是否是交叉点
                this._checkIsCrossPoint(point);
                if(i == PLANE_TYPE.THE_RED){
                    this._pointInArr.red.push(point);
                }else if(i == PLANE_TYPE.THE_YELLOW){
                    this._pointInArr.yellow.push(point);
                }else if(i == PLANE_TYPE.THE_BLUE){
                    this._pointInArr.blue.push(point);
                }else if(i == PLANE_TYPE.THE_GREEN){
                    this._pointInArr.green.push(point);
                }
            }
        }
    };

    /**
     * 初始化待机点
     */
    private _initWaitPoints(){
        for(let i = 0; i < FC_Chess._ChessPointPlaneWaitPosArr.length; i++){
            let p = FC_Chess._ChessPointPlaneWaitPosArr[i];     // 坐标
            let dir = FC_Chess._ChessPointPlaneWaitDirArr[i];   // 方向
            let point = new FC_ChessPoint(i);
            point.pos = p;
            point.direction = dir;
            point.isWaitPoint = true;           // 待机点
            
            if(i == PLANE_TYPE.THE_RED){
                point.color = COLOR.RED;
                this._planeWaitArr.red = point;
            }else if(i == PLANE_TYPE.THE_YELLOW){
                point.color = COLOR.YELLOW;
                this._planeWaitArr.yellow = point;
            }else if(i == PLANE_TYPE.THE_BLUE){
                point.color = COLOR.BLUE;
                this._planeWaitArr.blue = point;
            }else if(i == PLANE_TYPE.THE_GREEN){
                point.color = COLOR.GREEN;
                this._planeWaitArr.green = point;
            }
        }
    };

    /**
     * 初始化停驻点
     */
    private _initStopPoints(){
        for(let i = 0; i < FC_Chess._ChessPointPlaneStopPosArr.length; i++){
            let temp = FC_Chess._ChessPointPlaneStopPosArr[i];
            let dir = FC_Chess._ChessPointPlaneWaitDirArr[i];       // 方向
            let color: COLOR = null;
            let group = this._planeStopArr.red;
            if(i == PLANE_TYPE.THE_RED){
                color = COLOR.RED;
            }else if(i == PLANE_TYPE.THE_YELLOW){
                color = COLOR.YELLOW;
                group = this._planeStopArr.yellow;
            }else if(i == PLANE_TYPE.THE_BLUE){
                color = COLOR.BLUE;
                group = this._planeStopArr.blue;
            }else if(i == PLANE_TYPE.THE_GREEN){
                color = COLOR.GREEN;
                group = this._planeStopArr.green;
            }
            
            for(let j = 0; j < temp.length; j++){
                let p = temp[i];            // 坐标
                let point = new FC_ChessPoint(j);
                point.pos = p;
                point.color = color;
                point.direction = dir;
                point.isStopPoint = true;       // 停机点

                group.push(point);
            }
        }
    };



    /**
     * 获取外环棋点方向
     * @param index 序号
     */
    private _getOutPointDirection(index: Number): DIRECTION{
        for(let i = 0; i < FC_Chess._ChessPointOutDirArr.length; i++){
            let config = FC_Chess._ChessPointOutDirArr[i];
            let start = config[0];
            let end = config[1];
            let dir = config[2];
            if(index >= start && index <= end){
                // 处于这个方向范围内
                let direction: DIRECTION = this._numberToDirection(dir);
                return direction;
            }
        }
    };

    /**
     * 获取外环棋点颜色 按照黄-蓝-绿-红的顺序
     * @param index 序号
     */
    private _getOutPointColor(index: Number): COLOR{
        let num = (Number(index) + 1) % 4;
        let color: COLOR = null;
        switch(num){
            case 0:
                color = COLOR.YELLOW;
                break;
            case 1:
                color = COLOR.BLUE;
                break;
            case 2:
                color = COLOR.GREEN;
                break;
            case 3:
                color = COLOR.RED;
                break;
            default: 
                break;
        }
        return color;
    };

    /**
     * 检查是否是飞行开始点
     * @param index 
     */
    private _checkIsStartFlyPoint(index: Number): Boolean{
        for(let i = 0; i < FC_Chess._ChessPointPlaneStartIndexArr.length; i++){
            let temp = FC_Chess._ChessPointPlaneStartIndexArr[i];
            if(temp == index){
                return true;
            }
        }
        return false;
    };

    /**
     * 检查是否是外入内的切入点
     * @param index 
     */
    private _checkIsCutInPoint(index: Number): Boolean{
        for(let i = 0; i < FC_Chess._ChessPointPlaneToInIndexArr.length; i++){
            let temp = FC_Chess._ChessPointPlaneToInIndexArr[i];
            if(temp == index){
                return true;
            }
        }
        return false;
    };

    /**
     * 检查是否是飞行点
     * @param point 
     */
    private _checkIsFlyPoint(point: FC_ChessPoint){
        for(let i = 0; i < FC_Chess._ChessPointPlaneFlyIndexArr.length; i++){
            let temp = FC_Chess._ChessPointPlaneFlyIndexArr[i];
            let start = temp[0];
            let end = temp[1];
            let dir = this._numberToDirection(temp[2]);
            if(point.index == start || point.index == end){
                if(point.index == start){
                    point.isFlyStartPoint = true;
                }else if(point.index == end){
                    point.isFlyEndPoint = true;
                }
                point.direction = dir;
                point.setFlyIndex(start, end);
            }
            
        }
    };

    /**
     * 检查是否是内环交叉点
     * @param point 
     */
    private _checkIsCrossPoint(point: FC_ChessPoint){
        for(let i = 0; i < FC_Chess._ChessPointPlaneInCrossFlyLineIndexArr.length; i++){
            let temp = FC_Chess._ChessPointPlaneInCrossFlyLineIndexArr[i];
            let p = temp[0];
            let color = this._numberToColor(temp[1]);
            if(point.index == p){
                point.setCrossColor(color);
            }
        }
    };

    /**
     * 获取内环颜色
     * @param num 
     */
    private _getInnerPointColor(num: Number): COLOR{
        let color: COLOR = null;
        if(num == 0){
            color = COLOR.RED;
        }else if(num == 1){
            color = COLOR.YELLOW;
        }else if(num == 2){
            color = COLOR.BLUE;
        }else if(num == 3){
            color = COLOR.GREEN;
        }
        return color;
    };

    /**
     * 数字转方向
     * @param num 
     */
    private _numberToDirection(num: Number): DIRECTION{
        let direction: DIRECTION = null;
        if(num == DIRECTION.DOWN){
            direction = DIRECTION.DOWN;
        }else if(num == DIRECTION.UP){
            direction = DIRECTION.UP;
        }else if(num == DIRECTION.LEFT){
            direction = DIRECTION.LEFT;
        }else if(num == DIRECTION.RIGHT){
            direction = DIRECTION.RIGHT;
        }
        return direction;
    };

    /**
     * 数字转颜色
     * @param num 
     */
    private _numberToColor(num: Number): COLOR{
        let color: COLOR = null;
        if(num == COLOR.RED){
            color = COLOR.RED;
        }else if(num == COLOR.BLUE){
            color = COLOR.BLUE;
        }else if(num == COLOR.YELLOW){
            color = COLOR.YELLOW;
        }else if(num == COLOR.GREEN){
            color = COLOR.GREEN;
        }
        return color;
    };
}
