/**
 * 指令类
 */
export default class Comm_Command {
    public constructor(command: string, content: any = null) {
        this._command = command;
        this._content = content;
        this._complete = false;
    };

    private static _FailError_1 = '指令名错误';
    private static _FailError_2 = '没有对应的参数内容';

    private _command: string = null;        // 指令名
    private _content: any = null;           // 参数内容
    private _complete: boolean = null;      // 是否完成(只能改一次,只能改为true)
    private _failError: any = null;         // 指令失败的错误信息

    /**
     * 设置默认指令错误信息
     * @param num 1: 指令名错误；2：没有指定的参数内容
     * @param other 其他信息，只接受字符串
     */
    private _setDefaultFailError(num: number, other: string = ''){
        other = typeof other === 'string' ? other : '';
        if(num == 1){
            this._failError = {
                code: -1,
                msg: `${this._command}: ${Comm_Command._FailError_1} - ${other}`
            };
        }else if(num == 2){
            this._failError = {
                code: -1,
                msg: `${this._command}: ${Comm_Command._FailError_2} - ${other}`
            };
        }
    };

    /**
     * 检查指令是否有错误 true无错 false有错
     * @param num 1: 检查指令名；2：检查指令参数内容
     * @param other 其他信息，只接受字符串
     */
    public checkCommand(num: number, other: string = ''): boolean{
        let result = true;
        if(num == 1){
            if(!this._command){
                this._setDefaultFailError(1, other);
                result = false;
            }
        }else if(num == 2){
            if(!this._content){
                this._setDefaultFailError(2, other);
                result = false;
            }
        }

        return result;
    };

    public get command(): string{
        return this._command;
    };

    public get content(): any{
        return this._content;
    };
    public set content(obj: any){
        this._content = obj;
    };

    public get complete(): boolean{
        return this._complete;
    };
    public set complete(bool: boolean){
        if(!bool) return;
        if(this._complete) return;
        this._complete = true;
    };

    public get failError(): any{
        return this._failError;
    };
    public set failError(obj: any){
        this._failError = obj;
    };
}