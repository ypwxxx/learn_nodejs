import Comm_Model from "./Comm_Model";
import Comm_Contronller from "./Comm_Contronller";
import Comm_ContronllerComponent from "./Comm_ContronllerComponent";

interface M_C {
    model: Comm_Model,
    contronller: Comm_Contronller | Comm_ContronllerComponent
};

/**
 * 绑定器模块
 */
export default class Comm_Binder {
    private constructor() {
        this._binder = [];
    };
    private static instance: Comm_Binder = null;
    public static getInstance(): Comm_Binder{
        this.instance = this.instance ? this.instance : new Comm_Binder();
        return this.instance;
    };

    private _binder: M_C[] = null;

    /**
     * 绑定model and contronller
     * @param m model
     * @param c contronller || contronllerComponent
     */
    public bindMC(m: Comm_Model, c: cc.Node | Comm_Contronller | Comm_ContronllerComponent){
        if(c instanceof cc.Node){
            let com = <Comm_ContronllerComponent>c.getComponent("Comm_ContronllerComponent");
            if(com){
                c = com;
            }else{
                return;
            }
        }
        if(this.findMC(c) !== -1){
            // c已经绑定了
            return;
        }
        let mc: M_C = {
            model: m,
            contronller: c
        };
        m.sendMessageToContronller = function(command){
            mc.contronller.receivedMessageByModel(command);
        }.bind(m);
        c.sendMessageToModel = function(command){
            mc.model.receivedMessageByContronller(command);
        }.bind(c);
        this._binder.push(mc);
    };

    /**
     * 查找
     * @param mc model || contronller || contronllerComponent || cc.Node
     */
    public findMC(mc: Comm_Model | Comm_Contronller | Comm_ContronllerComponent | cc.Node): Number{
        let result = false;
        let index = null;
        if(mc instanceof Comm_Model){
            for(let i = 0; i < this._binder.length; i++){
                if(mc === this._binder[i].model){
                    result = true;
                }
            }
        }else if(mc instanceof Comm_Contronller){
            for(let i = 0; i < this._binder.length; i++){
                if(mc === this._binder[i].contronller){
                    result = false;
                }
            }
        }else if(mc instanceof Comm_ContronllerComponent){
            for(let i = 0; i < this._binder.length; i++){
                if(mc === this._binder[i].contronller){
                    result = false;
                }
            }
        }else if(mc instanceof cc.Node){
            mc = <Comm_ContronllerComponent>mc.getComponent("Comm_ContronllerComponent");
            if(mc){
                for(let i = 0; i < this._binder.length; i++){
                    if(mc === this._binder[i].contronller){
                        result = false;
                    }
                }
            }
        }
        if(result){
            return index;
        }else{
            return -1;
        }
    };

    /**
     * 删除指定的
     * @param mc model || contronller || contronllerComponent || cc.Node
     */
    public deleteMC(mc: Comm_Model | Comm_Contronller | Comm_ContronllerComponent | cc.Node){
        let index = Number(this.findMC(mc));
        if( index > -1){
            let mc = this._binder.splice(index, 1);
            mc[0].contronller.sendMessageToModel = null;
            mc[0].model.sendMessageToContronller = null;
        }
    };

    /**
     * 删除所有
     */
    public deleteAll(){
        while(this._binder.length != 0){
            let mc = this._binder.pop();
            mc.contronller.sendMessageToModel = null;
            mc.model.sendMessageToContronller = null;
        }
    };
};
