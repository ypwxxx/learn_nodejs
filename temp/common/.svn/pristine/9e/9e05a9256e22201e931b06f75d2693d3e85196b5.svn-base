const CCGlobl = require('CCGlobal');
const WXMoreGameBanner = require('WXMoreGameCore');
const Examin = require('Examin');
const {ccclass, property} = cc._decorator;

const {ccclass, property} = cc._decorator;

@ccclass
export default class MoreGameGrid extends cc.Component {

    @property(cc.SpriteFrame)
    left: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    right: cc.SpriteFrame = null;
    @property
    direction: string = "";
    @property(cc.Node)
    Node: cc.Node = null;
    @property(cc.Prefab)
    newMoreGame: cc.Prefab = null;
    @property(cc.Prefab)
    iconOption: cc.Prefab = null;
    @property
    haveGameClub:Boolean =false;

    start() {
        this.MoreGameGrid();
        let sprite = this.Node.getComponent(cc.Sprite);
        if (this.direction == "left") {
            sprite.spriteFrame = this.left;
        } else {
            sprite.spriteFrame = this.right;
        }
    }

    public MoreGameGrid() {
        WXMoreGameBanner.triangleCtrl({
            node: this.Node,
            newMoreGame: this.newMoreGame,
            iconOption: this.iconOption,
            haveGameClub:this.haveGameClub,
        })
    };
}
