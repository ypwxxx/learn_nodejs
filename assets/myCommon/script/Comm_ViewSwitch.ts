/* *场景切换专用组件* */

const {ccclass, property} = cc._decorator;
import {NOTIFICATION} from "./Comm_modules";
import { ViewSwitch_ViewNameMap, ViewSwitch_ViewProp, ViewSwitch_Options } from "./Comm_interface";
import { COMM_EVENT, VIEW_SWITCH_TYPE, ACTION_TAG } from "./Comm_Enum";

@ccclass
export default class ViewSwitch extends cc.Component {
    @property(Boolean)
    isNeedToast = true;

    @property(cc.Prefab)
    toastPrefab: cc.Prefab = null;

    @property({
        type: VIEW_SWITCH_TYPE,
        tooltip: `view默认切换方式: \nMOVE_LEFT: 从左边移入/移出\nMOVE_RIGHT: 从右边移入/移出\nHIDE: 淡入淡出`,
    })
    defaultSwitchType = VIEW_SWITCH_TYPE.MOVE_LEFT;

    @property(cc.Integer)
    _otherViewCount = 0;

    @property(cc.Node)
    otherViewNode: cc.Node = null;

    @property([cc.Prefab])
    _otherView: cc.Prefab[] = [];

    @property({
        type: [cc.Prefab]
    })
    get otherView (){
        return this._otherView;
    };
    set otherView (value){
        this._otherView = value;

        let arr1 = [];
        let arr2 = [];
        for(let i = 0; i < value.length; i++){
            if(typeof this._otherViewName[i] == 'undefined' || this._otherViewName[i] == null){
                arr1.push('');
            }else{
                arr1.push(this._otherViewName[i]);
            }
            if(typeof this._otherViewComponentName[i] == 'undefined' || this._otherViewComponentName[i] == null){
                arr2.push('');
            }else{
                arr2.push(this._otherViewComponentName[i]);
            }
        }
        this._otherViewName = arr1;
        this._otherViewComponentName = arr2;
        this._otherViewCount = value.length;
    };

    @property([cc.String])
    _otherViewName = [];

    @property({
        type: [cc.String],
        tooltip: '对应otherView数组顺序的view名, 调用时需要用到, 请不要使用重复的命名!否则可能导致错误!'
    })
    get otherViewName (){
        return this._otherViewName;
    };
    set otherViewName (value){
        let arr = [];
        for(let i = 0; i < this._otherViewCount; i++){
            if(typeof this._otherViewName[i] == 'undefined' || this._otherViewName[i] == null){
                arr.push('');
            }else{
                arr.push(this._otherViewName[i]);
            }
        }
        this._otherViewName = arr;
    };

    @property([cc.String])
    _otherViewComponentName = [];

    @property({
        type: [cc.String],
        tooltip: '对应otherView数组顺序的自定义脚本名, 初始化时需要用到, 请不要使用重复的命名!否则可能导致错误!'
    })
    get ViewComponentName (){
        return this._otherViewComponentName;
    };
    set ViewComponentName (value){
        let arr = [];
        for(let i = 0; i < this._otherViewCount; i++){
            if(typeof this._otherViewComponentName[i] == 'undefined' || this._otherViewComponentName[i] == null){
                arr.push('');
            }else{
                arr.push(this._otherViewComponentName[i]);
            }
        }
        this._otherViewComponentName = arr;
    };

    @property(cc.Node)
    mask: cc.Node = null;

    private static MoveTime: number = 0.3;       // 移动时间
    private static MoveDistance: number = -1000;      // 移动距离
    protected viewNameMap: ViewSwitch_ViewNameMap = {};
    protected centerView: string[] = null;            // 正在显示的view
    private _commandStack: (ViewSwitch_Options | string)[] = [];

    // 初始化
    onLoad(): void{
        // 遍历命名数组,如果命名有错误则报错
        for(let i = 0; i < this._otherViewName.length; i++){
            for(let j = i + 1; j < this._otherViewName.length; j++){
                if(this._otherViewName[i] === this._otherViewName[j]){
                    return console.error('viewSwitch 中的view命名不能有重复! 重复命名: ' + this._otherViewName[i]);
                }
            }
        }

        for(let i = 0; i < this._otherView.length; i++){
            let obj: ViewSwitch_ViewProp = {
                prefab: this._otherView[i],
                instance: null,
                isMove: false,
                name: this._otherViewComponentName[i],
                solo: true,
                switchType: this.defaultSwitchType,
            }
            this.viewNameMap[this._otherViewName[i]] = obj
        }

        // 加入toastView
        if(this.isNeedToast && this.toastPrefab){
            let toastView = cc.instantiate(this.toastPrefab);
            toastView.parent = this.node;
            toastView.zIndex = 100;
        }

        this.node.setContentSize(cc.view.getVisibleSize());

        // 启用监听
        NOTIFICATION.on(COMM_EVENT.SWITCH_VIEW, this._addCommandStack, this);
        NOTIFICATION.on(COMM_EVENT.OPEN_MASK, this._openMask, this);
        NOTIFICATION.on(COMM_EVENT.CLOSE_MASK, this._closeMask, this);
        
        this.centerView = [];
        this._closeMask();
    };

    /**
     * 切换场景
     * @param {switchOptions}
     * @param {string} options 
     */
    private _switchView(options: ViewSwitch_Options | string): void{
        // // 如果有view正在移动,则不切换
        // if(this._checkHasAnyViewMoving()) return;

        let name = null;
        let moveInCallback = null;
        let moveOutCallback = null;
        let switchType = this.defaultSwitchType;
        let solo = true;

        if(typeof options === 'string'){
            name = options;
        }else{
            name = options.name;
            let view = this.viewNameMap[name];

            moveInCallback = typeof options.moveInFunc === 'function' ? options.moveInFunc: null;
            moveOutCallback = typeof options.moveOutFunc === 'function' ? options.moveOutFunc: null;
            switchType = typeof options.type === 'number' ? options.type: view.switchType;
            solo = typeof options.solo === 'boolean' ? options.solo: view.solo;

            view.switchType = switchType;
            view.solo = solo;
        }
        let isMoveIn = this._checkMoveInOrOut(name);

        if(name === 'main'){
            // 切回主页面
            this._moveOutAllView(moveOutCallback);

        }else{
            if(!isMoveIn){
                for(let i in this.centerView){
                    if(this.centerView[i] === name){
                        this._moveOut(name, moveOutCallback);
                        this.centerView.splice(Number(i), 1);
                    }
                }
            }else{
                this._moveIn(name, moveInCallback);
                // 是否独显
                if(solo){
                    this._moveOutAllView(moveOutCallback);
                }
    
                this.centerView.push(name);
            }
        }
    };

    // // 检查view是否移动中
    // private _checkHasAnyViewMoving(): boolean{
    //     let result = false;
    //     let keys = Object.keys(this.viewNameMap);
    //     for(let key of keys){
    //         if(this.viewNameMap[key].isMove){
    //             result = true;
    //             break;
    //         }
    //     }
    //     return result;
    // };

    // 移入
    private _moveIn(name: string, callback?: Function):void{
        if(typeof name == 'undefined') return;

        // 启用点击屏蔽
        this._openMask();

        let view = this.viewNameMap[name];
        let type = view.switchType;
        view.isMove = true;

        if(!view.instance){
            view.instance = cc.instantiate(view.prefab);
            view.instance.parent = this.otherViewNode;
            view.instance.height = this.node.height;
            view.instance.getComponent(view.name).init();
        }else{
            view.instance.active = true;
        }

        if(callback){
            callback();
        }

        view.instance.getComponent(view.name).flushView();

        view.instance.opacity = 255;
        if(type === VIEW_SWITCH_TYPE.MOVE_LEFT){
            view.instance.setPosition(ViewSwitch.MoveDistance, 0);
        }else if(type === VIEW_SWITCH_TYPE.MOVE_RIGHT){
            view.instance.setPosition(-ViewSwitch.MoveDistance, 0);
        }else if(type === VIEW_SWITCH_TYPE.HIDE){
            view.instance.opacity = 0;
            view.instance.setPosition(0, 0);
        }

        let moveIn = this._getActionByType(type, 'in');
        let action = cc.sequence(
            moveIn,
            cc.callFunc(() => {
                view.isMove = false;
                // 关闭点击屏蔽
                this._closeMask();

                // 检查命令栈
                this._checkCommandStack();
            })
        );
        action.setTag(ACTION_TAG);
        view.instance.stopActionByTag(ACTION_TAG);
        view.instance.runAction(action);
    };

    // 移出
    private _moveOut(name: string, callback?: Function): void{
        if(!name) return;

        // 启动点击屏蔽
        this._openMask();

        let view = this.viewNameMap[name];
        let type = view.switchType;
        let moveOut = this._getActionByType(type, 'out');
        let action = cc.sequence(
            moveOut,
            cc.callFunc(() => {
                if(callback){
                    callback();
                }
                // 关闭点击屏蔽
                this._closeMask();

                view.instance.active = false;
                view.isMove = false;

                // 检查命令栈
                this._checkCommandStack();
            })
        );
        action.setTag(ACTION_TAG);

        view.isMove = true;
        view.instance.stopActionByTag(ACTION_TAG);
        view.instance.runAction(action);
    };

    // 获取对应切换动作
    private _getActionByType(type, direction: string){
        let action = null;
        if(direction === 'in'){
            if(type === VIEW_SWITCH_TYPE.MOVE_LEFT){
                action = cc.moveTo(ViewSwitch.MoveTime, cc.v2(0, 0)).easing(cc.easeCubicActionOut());
            }else if(type === VIEW_SWITCH_TYPE.MOVE_RIGHT){
                action = cc.moveTo(ViewSwitch.MoveTime, cc.v2(0, 0)).easing(cc.easeCubicActionOut());
            }else if(type === VIEW_SWITCH_TYPE.HIDE){
                action = cc.fadeIn(ViewSwitch.MoveTime).easing(cc.easeCubicActionOut());
            }
        }else if(direction === 'out'){
            if(type === VIEW_SWITCH_TYPE.MOVE_LEFT){
                action = cc.moveTo(ViewSwitch.MoveTime, cc.v2(ViewSwitch.MoveDistance, 0)).easing(cc.easeCubicActionOut());
            }else if(type === VIEW_SWITCH_TYPE.MOVE_RIGHT){
                action = cc.moveTo(ViewSwitch.MoveTime, cc.v2(-ViewSwitch.MoveDistance, 0)).easing(cc.easeCubicActionOut());
            }else if(type === VIEW_SWITCH_TYPE.HIDE){
                action = cc.fadeOut(ViewSwitch.MoveTime).easing(cc.easeCubicActionOut());
            }
        }

        return action;
    };

    // 移出目前的所有view
    private _moveOutAllView(callback: Function){
        while(this.centerView.length !== 0){
            let nameOut = this.centerView.pop();
            this._moveOut(nameOut, callback);
            callback = null;
        }
    };

    // 检查是移入还是移出
    private _checkMoveInOrOut(name: string){
        let moveIn = true;
        for(let i in this.centerView){
            if(this.centerView[i] === name){
                moveIn = false;
            }
        }

        return moveIn;
    };

    // 加入命令栈
    private _addCommandStack(data: ViewSwitch_Options | string){
        this._commandStack.push(data);

        this._checkCommandStack();
    };

    // 检查命令栈
    private _checkCommandStack(){
        if(this._commandStack.length !== 0){
            let data = this._commandStack.shift();
            this._switchView(data);
        }
    };

    // 打开遮罩
    private _openMask(){
        this.mask.active = true;
    };

    // 关闭遮罩
    private _closeMask(){
        this.mask.active = false;
    }

    public onDestroy(){
        for(let i in this.viewNameMap){
            if(this.viewNameMap[i].instance){
                this.viewNameMap[i].instance.stopAllActions();
            }
        }

        NOTIFICATION.offByTarget(this);
    };
}
