import Comm_AssetsComponent from "./Comm_AssetsComponent";

/**
 * 资源类
 */

export default class Comm_Assets {
    private constructor(target: Comm_AssetsComponent) {
        this._component = target;
        this._atlatsMap = {};
        this._spriteFrameMap = {};
    };
    private static instance: Comm_Assets = null;
    public static getInstance(target: Comm_AssetsComponent): Comm_Assets{
        this.instance = this.instance ? this.instance : new Comm_Assets(target);
        return this.instance;
    };

    private _component: Comm_AssetsComponent = null;        // 资源组件
    private _atlatsMap: object = null;                      // 图集map
    private _spriteFrameMap: object = null;                 // 散图map

    /**
     * 从图集中获取sp
     * @param atlasName 图集名
     * @param textureName 图片名
     */
    public getSpriteFrameByAtlas(atlasName: string, textureName: string | string[]){
        let atlas: cc.SpriteAtlas = null;
        let spriteFrame: cc.SpriteFrame | object = null;
        if(this._atlatsMap[atlasName]){
            atlas = this._atlatsMap[atlasName];
        }else{
            for(let i = 0; i < this._component.sp_atlas.length; i++){
                let a = this._component.sp_atlas[i];
                if(a.name === atlasName){
                    this._atlatsMap[atlasName] = a;
                    atlas = a;
                }
            }
        }

        if(!atlas) return;
        if(typeof textureName === 'string'){
            spriteFrame = atlas.getSpriteFrame(textureName);
        }else if(Array.isArray(textureName)){
            spriteFrame = {};
            for(let i = 0; i < textureName.length; i++){
                let sp =atlas.getSpriteFrame(textureName[i]);
                spriteFrame[textureName[i]] = sp;
            }
        }

        return spriteFrame;
    };

    /**
     * 从散图获取sp
     * @param textureName 图片名
     */
    public getSpriteFrameBySpriteFrames(textureName: string | string[]){
        let spriteFrame: cc.SpriteFrame | object = null;
        if(typeof textureName === 'string'){
            if(this._spriteFrameMap.hasOwnProperty(textureName)){
                spriteFrame = this._spriteFrameMap[textureName];
            }else{
                let temp = this._findSpriteFrameInScatter(textureName);
                if(temp !== -1){
                    this._spriteFrameMap[textureName] = temp;
                    spriteFrame = this._component.sp_frame[temp];
                }
            }

        }else if(Array.isArray(textureName)){
            spriteFrame = {};
            for(let i = 0; i < textureName.length; i++){
                let name = textureName[i];

                if(this._spriteFrameMap.hasOwnProperty(name)){
                    spriteFrame[name] = this._component.sp_frame[this._spriteFrameMap[name]];
                }else{
                    let temp = this._findSpriteFrameInScatter(name);
                    if(temp !== -1){
                        this._spriteFrameMap[name] = temp;
                        spriteFrame[name] = this._component.sp_frame[temp];
                    }else{
                        spriteFrame[name] = null;
                    }
                }
            }
        }
    };

    /**
     * 寻找散图中的对应索引
     * @param name 
     */
    private _findSpriteFrameInScatter(name: string): number{
        let index = -1;
        for(let i = 0; i < this._component.sp_frame.length; i++){
            let sp = this._component.sp_frame[i];
            if(sp.name === name){
                index = i;
                break;
            }
        }
        return index;
    }
}
