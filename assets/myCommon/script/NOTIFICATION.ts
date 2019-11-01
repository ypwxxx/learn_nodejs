/* *自定义事件通知* */

interface Event {
    callback: Function,
    target: any,
    once?: boolean,
    id?: number,
};

interface EventList {
    [type: string]: Event[],
};

export default class NOTIFICATION {
    private constructor() {};
    private static instance: NOTIFICATION = null;

    public static getInstance(): NOTIFICATION {
        this.instance = this.instance || new NOTIFICATION();
        return this.instance;
    };

    private _eventId = 0;
    private _eventList: EventList = {};

    /**
     * 监听
     * @param type 事件名
     * @param callback 回调方法
     * @param target 发起监听的目标
     */
    public on(type: string, callback: Function, target: any): void {
        if (typeof target === "undefined") {
            cc.error("GLOBAL_DEF.js: NOTIFICATION method 'on' param error!");
            return;
        }
        if (typeof this._eventList[type] === "undefined") {
            let arr: Event[] = [];
            this._eventList[type] = arr;
        }
        let event:Event = {
            callback: callback,
            target: target,
            id: this._eventId,
        }
        this._eventList[type].push(event);
        this._eventId++;
    };

    /**
     * 监听,只监听一次
     * @param type 事件名
     * @param callback 回调方法
     * @param target 发起监听的对象
     */
    public once(type: string, callback: Function, target: any) {
        if (typeof target === "undefined") {
            cc.error("GLOBAL_DEF.js: NOTIFICATION method 'on' param error!");
            return;
        }
        if (typeof this._eventList[type] === "undefined") {
            let arr: Event[] = [];
            this._eventList[type] = arr;
        }
        this._eventList[type].push({callback: callback, target: target, once: true});
    };

    /**
     * 触发被监听的事件
     * @param type 事件名
     * @param data 需要被传入回调的方法
     */
    public emit(type: string, data: any = null) {
        let list: Event[] = this._eventList[type];
        if (typeof list !== "undefined") {
            let listBackUp: number[] = [];
            list.forEach( event => {
                listBackUp.push(event.id);
            });

            listBackUp.forEach( id => {
                list.forEach( event => {
                    if(id === event.id){
                        if(data === null || data === undefined){
                            event.callback.call(event.target);
                        }else{
                            event.callback.call(event.target, data);
                        }
        
                        if(event.once){
                            this.off(type, event.callback, event.target);
                        }
                    }
                });
            });
        }
    };

    /**
     * 取消监听
     * @param type 被取消的事件名
     * @param callback 被取消的回调方法
     * @param target 被取消的目标
     */
    public off(type: string, callback: Function, target: any) {
        if (typeof target === "undefined") {
            cc.error("GLOBAL_DEF.js: NOTIFICATION method 'off' param error!");
            return;
        }
        let list = this._eventList[type];
        if (typeof list !== "undefined") {
            for (let i = 0; i < list.length; i++) {
                let event = list[i];
                if (event && event.callback === callback && event.target === target) {
                    list.splice(i, 1);
                    break;
                }
            }
        }
    };

    /**
     * 取消type类型的所有监听
     * @param type 被取消的type类型方法
     */
    public offByType(type: string) {
        if (typeof type !== "string") {
            cc.error("GLOBAL_DEF.js: NOTIFICATION method 'offByType' param error!");
            return;
        }
        if(this._eventList[type] !== undefined){
            while (this._eventList[type].length > 0) {
                this._eventList[type].shift();
            }
        }

        this._eventList[type] = undefined;
    };

    /**
     * 取消目标节点所有的监听
     * @param target 需要被取消监听的目标
     */
    public offByTarget(target: any){
        if (typeof target === "undefined") {
            cc.error("GLOBAL_DEF.js: NOTIFICATION method 'offByTarget' param error!");
            return;
        }
        for(let key in this._eventList){
            if(this._eventList[key] !== undefined){
                for(let i = 0; i < this._eventList[key].length ; i++){
                    if(this._eventList[key][i].target === target){
                        this._eventList[key].splice(i, 1);
                        // cc.log('off ' + key);
                        break;
                    }
                }
            }
        }
    };

    /**
     * 取消当前的所有监听
     */
    public offAll(): void{
        for(let key in this._eventList){
            this.offByType(key);
        }
    };
};