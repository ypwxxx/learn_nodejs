import Comm_ContronllerComponent from "../../myCommon/script/Comm_ContronllerComponent";
import Comm_Binder from "../../myCommon/script/Comm_Binder";
import FC_PlaneModel from "./FC_PlaneModel";
import { COMMAND_PLANE } from "./FC_Constant";
import Comm_Command from "../../myCommon/script/Comm_Command";

/**
 * 飞机控制类
 */
const {ccclass, property} = cc._decorator;

@ccclass
export default class FC_PlaneContronller extends Comm_ContronllerComponent {

    @property(cc.Sprite)
    sp_skin: cc.Sprite = null;

    public static PLANE_DIRECTION = {
        UP: 0,
        DOWN: 180,
        LEFT: 270,
        RIGHT: 90,
    }

    public reuse(model: FC_PlaneModel){
        Comm_Binder.getInstance().bindMC(model, this);
    };

    public unuse(){
        Comm_Binder.getInstance().deleteMC(this);
    };

    public receivedMessageByModel(command: Comm_Command){
        switch(command.command){
            case COMMAND_PLANE.set_skin :
                // this._setSkin(data);
            case COMMAND_PLANE.set_pos :

        }
    };

    private _setSkin(){

    };
}
