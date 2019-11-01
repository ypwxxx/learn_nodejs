/**
 * 自动释放资源
 */

interface ScenesName {
    main: string,
    other: [string],
};

export default class Comm_AutoRelease {
    private constructor() {};
    private static instance: Comm_AutoRelease = null;

    public static getInstance(): Comm_AutoRelease {
        this.instance = this.instance || new Comm_AutoRelease();
        return this.instance;
    };

    protected scenesAssets = {};

    private _isFirst: boolean = true;

    public init(scenesName: ScenesName){
        // if(!this._isFirst) return;
        // this._isFirst = false;

        // let curScene = cc.director.getScene();
        // if(curScene.name === scenesName.main){
        //     this.scenesAssets.main = curScene.dependAssets;
        // }

        
    };
};
