/**
 * 音频相关组件
 * 说明: 通用音频相关的组件, 包含声音开关, 震动开关
 * 维护人员: 余鹏为
 * 时间: 2019/9/16
 * 版本:
 * @version 1.0.0 初版, 包含声音获取/控制, 震动获取/控制功能.
 * @version 1.0.1 完善对震动的控制,添加初始化判断,无需手动初始化, 修改By姚仲儒 2019/9/17.
 */





interface AudioData {
    volume: boolean,
    vibrate: boolean,
};

class CommAudio {
    private constructor() {
    };

    private static instance: CommAudio = null;

    public static getInstance(): CommAudio {
        this.instance = this.instance || new CommAudio();
        return this.instance;
    };

    private _data: AudioData = null;
    private _saveStr = 'CommAudio';

    public get volume() {
        if (!this._data) this.init();
        return this._data.volume;
    };

    public set volume(bool: boolean) {
        this._data.volume = !!bool;
        this._save();
    };

    public get vibrate() {
        if (!this._data) this.init();
        return this._data.vibrate;
    };

    public set vibrate(bool: boolean) {
        this._data.vibrate = !!bool;
        this._save();
    };

    // 初始化
    public init() {
        let data = cc.sys.localStorage.getItem(this._saveStr);
        if (typeof data === 'string' && data != '') {
            this._data = JSON.parse(data);
        } else {
            this._data = {
                volume: true,
                vibrate: true,
            }
            let itemArr = ["volume", "vibrate"];
            for (let i = 0; i < itemArr.length; i++) {
                let item = cc.sys.localStorage.getItem(itemArr[i]);
                if (item === "0") {
                    this._data[itemArr[i]] = false;
                } else {
                    this._data[itemArr[i]] = true;
                }
            }
            this._save();
        }
    };

    // 重置
    public reset() {
        this._data = {
            volume: true,
            vibrate: true,
        }
        this._save();
    }

    public _save() {
        cc.sys.localStorage.setItem(this._saveStr, JSON.stringify(this._data));
        let volume = this._data.volume ? "1" : "0";
        cc.sys.localStorage.setItem('volume', volume);
        let vibrate = this._data.vibrate ? "1" : "0";
        cc.sys.localStorage.setItem('vibrate', vibrate);
    };
}

module.exports = CommAudio.getInstance();