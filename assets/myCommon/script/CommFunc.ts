import Comm_Command from "./Comm_Command";

/* *公共方法* */

export default class CommFunc {
    private constructor() {};
    private static instance: CommFunc = null;

    public static getInstance(): CommFunc {
        this.instance = this.instance || new CommFunc();
        return this.instance;
    };

    private _name: string
    set name(value: string) {
      this._name = value
    };
    get name(): string {
      return this._name
    };

    /**
     * 获取时间
     */
    public getTime(){
        return Date.now();
    };

    /**
     * 切换场景
     * @param sceneName 需要切换的场景名
     */
    public switchScene(sceneName: string): void{
        cc.director.preloadScene(sceneName, function(error){
            cc.director.loadScene(sceneName);
        });
    };

    /**
     * 派发事件
     * @param node 派发事件的节点
     * @param eventName 事件名
     * @param data 事件传递需要的数据
     */
    public sendEvent(node: cc.Node, eventName: string, data?: any){
        let event = new cc.Event.EventCustom(eventName, true);
        event.setUserData(data);
        node.dispatchEvent(event);
    };

    /**
     * 生成从minNum到maxNum的随机数
     * @param num1 最小值
     * @param num2 最大值
     */
    public randomNum (num1: number,num2: number): number{
        num1 = Number(num1);
        num2 = Number(num2);
        let min = Math.min(num1, num2);
        let max = Math.max(num1, num2);
        switch(arguments.length){
            case 1:
                return Number(this.rand(min) + 1);
            case 2:
                return Number(this.rand(max - min + 1) + min);
            default:
                return 0;
        }
    };

    /**
     * 随机数生成
     * @param number 随机值的最大范围,不包括该值
     */
    public rand (number): number{
        return Math.floor(Math.random() * number);
    };

    /**
     * 深拷贝
     * @param obj 需要拷贝的对象
     */
    public deepClone(obj: any): any{
        //判断拷贝的要进行深拷贝的是数组还是对象，是数组的话进行数组拷贝，对象的话进行对象拷贝
        let objClone = null;
        if(!Array.isArray(obj) && typeof obj === 'object'){
            objClone = obj;
            return objClone;
        }

        objClone = Array.isArray(obj) ? [] : {};
        //进行深拷贝的不能为空，并且是对象或者是
        if (obj && typeof obj === "object") {
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (obj[key] && typeof obj[key] === "object") {
                        objClone[key] = this.deepClone(obj[key]);
                    } else {
                        objClone[key] = obj[key];
                    }
                }
            }
        }
        return objClone;
    };

    /**
     * 获取命令
     * @param title 命令名
     * @param content 内容
     */
    public getCommand(title: string | string[], content?: any){
        let msg = '';
        if(Array.isArray(title)){
            msg = title.join('');
        }else{
            msg = title;
        }
        let cod = new Comm_Command(msg, content);
        return cod;
    }
}