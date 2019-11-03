/**
 * 自定义log类
 * 简单包装console
 */
class Comm_Log {
    private constructor(){};
    private static instance: Comm_Log = null;
    public static getInstance(){
        this.instance = this.instance ? this.instance : new Comm_Log();
        return this.instance;
    };

    public isLog: boolean = false;      // 是否开启log

    public log(message?: any, ...optionalParams: any[]){
        if(!this.isLog) return;
        console.log(message, optionalParams);
    };

    public warn(message?: any, ...optionalParams: any[]){
        if(!this.isLog) return;
        console.warn(message, optionalParams);
    };

    public error(message?: any, ...optionalParams: any[]){
        if(!this.isLog) return;
        console.error(message, optionalParams);
    };
}

export default Comm_Log.getInstance();