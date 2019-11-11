import FC_GameData from "./FC_GameData";
import { NOTIFICATION } from "../../myCommon/script/Comm_Modules";
import { FC_EVENT, PLANE_TYPE, PLAYER_TYPE } from "./FC_Constant";

/**
 * 设置游戏页面
 */

const {ccclass, property} = cc._decorator;

@ccclass
export default class FC_SetView extends cc.Component {

    // 选择的玩家类型描述
    @property([cc.Label])
    optionsDescribe: cc.Label[] = [];
    // 启动数字
    @property([cc.Sprite])
    launchNumSp: cc.Sprite[] = [];
    // 启动数字亮图
    @property([cc.SpriteFrame])
    launchNumLightSpFrames: cc.SpriteFrame[] = [];
    // 启动数字灰图
    @property([cc.SpriteFrame])
    launchNumGreySpFrames: cc.SpriteFrame[] = [];
    // 开始游戏按钮
    @property(cc.Node)
    node_start: cc.Node = null;

    // 0: 无 1: 电脑 2: 玩家
    private _playerSetObj = [0,0,0,0];
    // 0: 2/4/6 1: 5/6 2: 6
    private _launchNum = 0;
    private _describeArr = ["无", "电脑", "玩家"];
    private _defaultPlayers = [2, 1, 1, 1];

    public onLoad(){

    };

    // 激活时
    public onEnable(){
        // 显示默认界面
        for(let i = 0; i < this._defaultPlayers.length; i++){
            let type = this._defaultPlayers[i];
            this._playerSetObj[i] = type;
            this.optionsDescribe[i].string = this._describeArr[type] + (i + 1);
        }
        this.launchNumSp[0].spriteFrame = this.launchNumLightSpFrames[0];
        this.launchNumSp[1].spriteFrame = this.launchNumGreySpFrames[1];
        this.launchNumSp[2].spriteFrame = this.launchNumGreySpFrames[2];

        this._launchNum = 0;
    };

    // 禁用时
    public onDisable(){

    };

    //  选择玩家
    public btn_choosePlayer(touch: cc.Touch, data: string){
        let num = Number(data);
        this._playerSetObj[num]++;
        let type = this._playerSetObj[num];
        if(type > 2){
            this._playerSetObj[num] = 0;
            type = 0;
        }

        this.optionsDescribe[num].string = this._describeArr[type] + (num + 1);

        let bool = false;
        // 检查选择的是否符合规则
        if(this._checkPlayerType(this._playerSetObj)){
            // 符合
            bool = true;
        }
        this.node_start.active = bool;
    }

    // 选择起飞号
    public btn_chooseLaunchNum(touch: cc.Touch, data: string){
        let num = Number(data);
        if(this._launchNum !== num){
            this._launchNum = num;
        }
        for(let i = 0; i < 3; i++){
            if(i === this._launchNum){
                this.launchNumSp[i].spriteFrame = this.launchNumLightSpFrames[i];
            }else{
                this.launchNumSp[i].spriteFrame = this.launchNumGreySpFrames[i];
            }
        }
    };

    // 开始游戏
    public btn_startGame(){
        // 设置游戏参数
        let planeTypes = [];
        let playerTypes = [];
        for(let i = 0; i < this._playerSetObj.length; i++){
            if(this._playerSetObj[i] > 0){
                if(i == 0){
                    planeTypes.push(PLANE_TYPE.THE_RED);
                }else if(i == 1){
                    planeTypes.push(PLANE_TYPE.THE_YELLOW);
                }else if(i == 2){
                    planeTypes.push(PLANE_TYPE.THE_BLUE);
                }else if(i == 3){
                    planeTypes.push(PLANE_TYPE.THE_GREEN);
                }

                if(this._playerSetObj[i] === 1){
                    playerTypes.push(PLAYER_TYPE.AI);
                }else if(this._playerSetObj[i] === 2){
                    playerTypes.push(PLAYER_TYPE.OFFLINE);
                }
            }else{
                playerTypes.push(PLAYER_TYPE.NONE);
            }
        }

        // 记录游戏开始参数
        FC_GameData.getInstance().setStartInfo(planeTypes, playerTypes);

        // 检查是否是游戏页面
        let scene = cc.director.getScene();
        if(scene.name == "FC_GameScene"){
            NOTIFICATION.emit(FC_EVENT.GAME_RESTART);
        }else{
            cc.director.loadScene("FC_GameScene");
        }
    };
;
    // 返回
    public btn_back(){
        this.node.active = false;
    };

    // 检查玩家类型 0: 无 1: 电脑 2: 玩家
    private _checkPlayerType(type: number[]): boolean{
        let results = false;
        let playerCount = 0;            // 玩家数
        let realPlayerCount = 0;        // 真人玩家数
        for(let i = 0; i < type.length; i++){
            if(type[i] !== 0){
                playerCount++;
                if(type[i] === 2){
                    realPlayerCount++;
                }
            }
        }
        // 玩家个数至少大于2 且真人玩家至少有一个
        if(playerCount >= 2 && realPlayerCount >= 1){
            results = true;
        }

        return results;
    };
}

