// import Comm_Model from "./Comm_Model";
import Comm_Command from "./Comm_Command";

const {ccclass, property} = cc._decorator;

/**
 * 控制器组件类模块
 */
@ccclass
export default class Comm_ContronllerComponent extends cc.Component {

    // // 绑定的模块
    // public bindModel: Comm_Model = null;

    /**
     * 向model发送信息
     * @param command 指令
     */
    public sendMessageToModel(command: Comm_Command){
        // if(this.bindModel){
        //     this.bindModel.receivedMessageByContronller(command);
        // }
    };
    
    /**
     * 收到model发来的信息
     * @param command 指令
     */
    public receivedMessageByModel(command: Comm_Command){
        
    };
}
