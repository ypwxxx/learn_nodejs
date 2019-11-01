import Comm_Contronller from "./Comm_Contronller";
import Comm_ContronllerComponent from "./Comm_ContronllerComponent";
import Comm_Command from "./Comm_Command";

/**
 * 模块类模块
 */
export default class Comm_Model {
    public constructor() {

    };

    // 绑定的控制器
    public bindContronller: Comm_Contronller | Comm_ContronllerComponent = null;

    /**
     * 向控制器发送信息
     * @param msg 指令
     * @param data 数据
     * @param other 更多的数据
     */
    public sendMessageToContronller(command: Comm_Command){
        if(this.bindContronller){
            this.bindContronller.receivedMessageByModel(command);
        }
    };

    /**
     * 接收控制器的信息
     * @param msg 指令
     * @param data 数据
     * @param other 更多的数据
     */
    public receivedMessageByContronller(command: Comm_Command){
        
    }
};