import { PLANE_TYPE, GAME_BASE_DATA, PLAYER_TYPE } from "./FC_Constant";
import { CommFunc } from "../../myCommon/script/Comm_Modules";

/**
 * 游戏数据类
 */

export default class FC_GameData {
    private constructor(){};
    private static instance: FC_GameData = null;
    public static getInstance(): FC_GameData{
        this.instance = this.instance ? this.instance : new FC_GameData();
        return this.instance;
    };

    private _playerCount: number = 0;                   // 本局游戏的人数
    private _planeType: PLANE_TYPE[] = null;            // 本局参与的飞机类型
    private _launchPlaneNum: number[] = null;           // 起飞数字
    private _playerType: PLAYER_TYPE[] = null;          // 本局玩家类型
    private _playerIconIndexs: number[] = null;         // 玩家头像序号
    private _playerOrderIndexs: number[] = null;        // 玩家次序序号

    public get playerCount(): number {
        return this._playerCount;
    };

    public get planeType(): PLANE_TYPE[] {
        return this._planeType;
    };

    public get launchPlaneNums(): number[]{
        return this._launchPlaneNum;
    };

    // 设置开始游戏信息
    public setStartInfo(planeType: PLANE_TYPE[], playerType: PLAYER_TYPE[], isContinues: boolean = false){
        if(isContinues){
            // 继续游戏


        }else{
            // 新游戏
            this._playerCount = planeType.length;       // 玩家数量
            this._planeType = [];
            let playerArr = [];                         // 记录玩家类型
            for(let i = 0; i < planeType.length; i++){      // 飞机类型
                this._planeType.push(planeType[i]);
            }
            for(let i = 0; i < playerType.length; i++){     // 玩家类型
                this._playerType.push(playerType[i]);
                if(playerType[i] === PLAYER_TYPE.OFFLINE){
                    playerArr.push(i);
                }
            }

            // 头像(0-10中选择,互不相同)
            this._playerIconIndexs = [];
            let temp = [];
            for(let i = 0; i < 11; i++){
                temp.push(i);
            }
            let randSort = function(arr: any[] = [], times: number = 0){
                // 随机排序数组
                for(let i = 0; i < times; i++){
                    arr.sort(function(a, b){
                        return Math.random() > 0.5 ? 1 : -1;
                    });
                }
            };
            randSort(temp, 3);
            for(let i = 0; i < this._playerCount; i++){
                this._playerIconIndexs.push(temp.pop());
            }

            // 次序(优先玩家;多个玩家,从中随机)
            randSort(playerArr, 3);
            let firstOrder = playerArr[0];
            this._playerOrderIndexs = [-1, -1, -1, -1];
            for(let i = 0; i < this._playerOrderIndexs.length; i++){
                let abs = i - firstOrder;
                let index = 0;
                if(abs >= 0){
                    index = abs + 1;
                }else{
                    index = abs + 5;
                }
                this._playerOrderIndexs[i] = index;
            }
        }
    };

    // 获取开始游戏信息
    public getStartInfo(){
        return {
            count: this._playerCount,
            planeTypes: this._planeType,
        }
    };

    // 获取玩家类型
    public getPlayerType(type: PLANE_TYPE): PLAYER_TYPE{
        let results = null;
        if(type === PLANE_TYPE.THE_RED){
            results = 0;
        }else if(type === PLANE_TYPE.THE_YELLOW){
            results = 1;
        }else if(type === PLANE_TYPE.THE_BLUE){
            results = 2;
        }else if(type === PLANE_TYPE.THE_GREEN){
            results = 3;
        }
        return this._playerType[results];
    };

    // 获取玩家头像编号后缀
    public getPlayerIconIndex(type: PLANE_TYPE): number{
        let results = null;
        if(type === PLANE_TYPE.THE_RED){
            results = 0;
        }else if(type === PLANE_TYPE.THE_YELLOW){
            results = 1;
        }else if(type === PLANE_TYPE.THE_BLUE){
            results = 2;
        }else if(type === PLANE_TYPE.THE_GREEN){
            results = 3;
        }
        return this._playerIconIndexs[results];
    };

    // 获取玩家顺序
    public getPlayerOeder(type: PLANE_TYPE): number{
        let results = null;
        if(type === PLANE_TYPE.THE_RED){
            results = 0;
        }else if(type === PLANE_TYPE.THE_YELLOW){
            results = 1;
        }else if(type === PLANE_TYPE.THE_BLUE){
            results = 2;
        }else if(type === PLANE_TYPE.THE_GREEN){
            results = 3;
        }
        return this._playerOrderIndexs[results];
    };

    // 设置起飞数字
    public setLaunchNum(num: number){
        if(num <= 2 && num >= 0){
            this._launchPlaneNum = GAME_BASE_DATA.launch_plane_num[num];
        }
    };
}
