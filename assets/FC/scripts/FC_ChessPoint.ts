import { COLOR, DIRECTION, PLANE_TYPE } from "./FC_Constant";

/**
 * 棋点类
 */
export default class FC_ChessPoint {
    public constructor(index: Number) {
        this._index = index;
    };
    // 序号
    private _index: Number = null;
    // 位置坐标
    private _pos: cc.Vec2 = null;
    // 颜色
    private _color: COLOR = null;
    // 方向(停留的飞机的)
    private _direction: DIRECTION = null;
    // 内环
    private _innerRing: Boolean = null;
    // 外环
    private _outerRing: Boolean = null;
    // 待机点
    private _waitPoint: Boolean = null;
    // 停机点
    private _stopPoint: Boolean = null;
    // 起点
    private _startPoint: Boolean = null;
    // 切入点(外环->内环)
    private _cutPoint: Boolean = null;
    // 飞行点-起始
    private _flyStartPoint: Boolean = null;
    // 飞行点-结束
    private _flyEndPoint: Boolean = null;
    // 飞行起始点序号
    private _flyStartIndex: Number = null;
    // 飞行结束点序号
    private _flyEndIndex: Number = null;
    // 终点
    private _endPoint: Boolean = null;
    // 内环与飞行线交叉点
    private _crossPoint: Boolean = null;
    // 交叉颜色
    private _crossColor: COLOR = null;

    public get index(): Number{
        return this._index;
    };
    public set index(num: Number){
        this._index = num;
    };

    public get pos(): cc.Vec2{
        return this._pos;
    };
    public set pos(p: cc.Vec2){
        this._pos = p.clone();
    };

    public get color(): COLOR{
        return this._color;
    };
    public set color(co: COLOR){
        this._color = co;
    };

    public get direction(): DIRECTION{
        return this._direction;
    };
    public set direction(dir: DIRECTION){
        this._direction = dir;
    };

    public get isInnerRing(): Boolean{
        return this._innerRing;
    };
    public set isInnerRing(bool: Boolean){
        this._innerRing = bool;
        if(bool){
            this._outerRing = false;
            this._waitPoint = false;
            this._stopPoint = false;
        }
    };

    public get isOuterRing(): Boolean{
        return this._outerRing;
    };
    public set isOuterRing(bool: Boolean){
        this._outerRing = bool;
        if(bool){
            this._innerRing = false;
            this._waitPoint = false;
            this._stopPoint = false;
        }
    };

    public get isWaitPoint(): Boolean{
        return this._waitPoint;
    };
    public set isWaitPoint(bool: Boolean){
        this._waitPoint = bool;
        if(bool){
            this._innerRing = false;
            this._outerRing = false;
            this._stopPoint = false;
        }
    };

    public get isStopPoint(): Boolean{
        return this._stopPoint;
    };
    public set isStopPoint(bool: Boolean){
        this._stopPoint = bool;
        if(bool){
            this._innerRing = false;
            this._outerRing = false;
            this._waitPoint = false;
        }
    };

    public get isStartPoint(): Boolean{
        return this._startPoint;
    };
    public set isStartPoint(bool: Boolean){
        this._stopPoint = bool;
        if(bool){
            this._cutPoint = false;
            this._endPoint = false;
            this._flyStartPoint = false;
            this._flyEndPoint = false;
            this._crossPoint = false;
        }
    };

    public get isEndPoint(): Boolean{
        return this._endPoint;
    };
    public set isEndPoint(bool: Boolean){
        this._endPoint = bool;
        if(bool){
            this._cutPoint = false;
            this._startPoint = false;
            this._flyStartPoint = false;
            this._flyEndPoint = false;
            this._crossPoint = false;
        }
    };

    public get isCutPoint(): Boolean{
        return this._cutPoint;
    };
    public set isCutPoint(bool: Boolean){
        this._cutPoint = bool;
        if(bool){
            this._startPoint = false;
            this._endPoint = false;
            this._flyStartPoint = false;
            this._flyEndPoint = false;
            this._crossPoint = false;
        }
    };

    public get isFlyStartPoint(): Boolean{
        return this._flyStartPoint;
    };
    public set isFlyStartPoint(bool: Boolean){
        this._flyStartPoint = bool;
        if(bool){
            this._startPoint = false;
            this._endPoint = false;
            this._cutPoint = false;
            this._crossPoint = false;
            this._flyEndPoint = false;
        }
    };

    public get isFlyEndPoint(): Boolean{
        return this._flyEndPoint;
    };
    public set isFlyEndPoint(bool: Boolean){
        this._flyEndPoint = bool;
        if(bool){
            this._startPoint = false;
            this._endPoint = false;
            this._cutPoint = false;
            this._crossPoint = false;
            this._flyStartPoint = false;
        }
    };

    public get isCrossPoint(): Boolean{
        return this._crossPoint;
    };
    public set isCrossPoint(bool: Boolean){
        this._crossPoint = bool;
        if(bool){
            this._startPoint = false;
            this._endPoint = false;
            this._cutPoint = false;
            this._flyStartPoint = false;
            this._flyEndPoint = false;
        }
    };

    public get flyStartIndex(): Number{
        if(this._flyStartPoint || this._flyEndPoint){
            return this._flyStartIndex;
        }
    };
    public get flyEndIndex(): Number{
        if(this._flyStartPoint || this._flyEndPoint){
            return this._flyEndIndex;
        }
    };
    public get crossColor(): COLOR{
        if(this._crossPoint){
            return this._crossColor;
        }
    };
    public get isFlyPoint(): Boolean{
        if(this._flyStartPoint || this._flyEndPoint){
            return true;
        }else{
            return false;
        }
    }

    /**
     * 设置飞行的起始序号
     */
    public setFlyIndex(start: Number, end: Number){
        this._flyStartIndex = start;
        this._flyEndIndex = end;
    };

    /**
     * 设置交叉点颜色
     */
    public setCrossColor(color: COLOR){
        this._crossColor = color;
    }
}
