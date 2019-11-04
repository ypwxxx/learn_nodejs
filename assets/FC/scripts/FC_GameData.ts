import { PLANE_TYPE } from "./FC_Constant";

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

    private _playerCount: number = 0;               // 本局游戏的人数
    private _playerType: PLANE_TYPE[] = null;          // 本局参与的飞机类型

    public get playerCount(): number {
        return this._playerCount;
    };

    public get playerType(): PLANE_TYPE[] {
        return this._playerType;
    }

    // 设置开始游戏信息
    public setStartInfo(typeArr: PLANE_TYPE[]){
        this._playerCount = typeArr.length;
        this._playerType = [];
        for(let i = 0; i < typeArr.length; i++){
            this._playerType.push(typeArr[i]);
        }
    };

    // 获取开始游戏信息
    public getStartInfo(){
        return {
            count: this._playerCount,
            types: this._playerType
        }
    };
}
