import Comm_Assets from "./Comm_Assets";

/**
 * 资源类
 */
const {ccclass, property} = cc._decorator;

@ccclass
export default class Comm_AssetsComponent extends cc.Component {

    @property(Boolean)
    isPersistNode: Boolean = false;

    @property([cc.SpriteAtlas])
    sp_atlas: cc.SpriteAtlas[] = [];        // 图集资源
    @property([cc.SpriteFrame])
    sp_frame: cc.SpriteFrame[] = [];        // 散图资源
    
    public onLoad(){
        if(this.isPersistNode){
            // 检查是否是根节点
            let node = cc.director.getScene().getChildByName("AssetsNode");
            if(!node || node !== this.node){
                // 不是根节点
                this.node.removeFromParent(false);
                cc.director.getScene().addChild(this.node);
            }

            cc.game.addPersistRootNode(this.node);
        }

        Comm_Assets.getInstance(this);
    };
}