import Comm_Model from "./Comm_Model";
import Comm_Command from "./Comm_Command";

/**
 * 控制器模块
 */
export default class Comm_Contronller {
    public constructor() {

    };

    // 绑定的模块
    public bindModel: Comm_Model = null;

    /**
     * 向model发送信息
     * @param msg 指令
     * @param data 数据
     * @param other 更多的数据
     */
    public sendMessageToModel(command: Comm_Command){
        if(this.bindModel){
            this.bindModel.receivedMessageByContronller(command);
        }
    };
    
    /**
     * 收到model发来的信息
     * @param msg 指令
     * @param data 数据
     * @param other 更多的数据
     */
    public receivedMessageByModel(command: Comm_Command){
        
    };
};