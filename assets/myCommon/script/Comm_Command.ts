/**
 * 指令
 */
export default class Comm_Command {
    public constructor(command: string, content: any = null) {
        this._command = command;
        this._content = content;
        this._complete = false;
    };

    private _command: string = null;        // 指令名
    private _content: any = null;           // 内容
    private _complete: boolean = null;      // 是否完成(只能改一次,只能改为true)
    private _failError: any = null;         // 指令未完成的错误信息

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