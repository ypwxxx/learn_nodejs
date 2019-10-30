const CCGlobal = require('CCGlobal')
const CCConst = require('CCConst')
export default class WXFeedBack {
    private static _instance: WXFeedBack = null;

    public static getInstance(): WXFeedBack {
        this._instance = this._instance || new WXFeedBack();
        return this._instance;
    }

    private feedBackButton: any = null;
    private feedBackNode: any = null;


    /**
     *初始化按钮节点
     *
     *
     *
     * */
    initFeedBackNode(object) {
        if (object) this.feedBackNode = object;
    }

    /**
     * 创建反馈按钮
     * @param object
     */
    createFeedBackButton(object) {
        if (CCGlobal.platform == CCConst.PLATFORM.WEIXIN && CCGlobal.apiVer > "2.1.2") {
            this.destroyFeedBackButton();
            this.feedBackButton = wx.createFeedbackButton(object);
        }
    }

    /**
     * 隐藏反馈按钮
     */
    hideFeedBackButton() {
        if (this.feedBackButton)
            this.feedBackButton.hide();
        if (this.feedBackNode && cc.isValid(this.feedBackNode)) {
            this.feedBackNode.active = false;
        }
    }

    /**
     * 销毁按钮
     */
    destroyFeedBackButton() {
        if (this.feedBackButton)
            this.feedBackButton.destroy();

    }

    /**
     * 显示按钮
     */
    showFeedBackButton() {
        if (this.feedBackButton)
            this.feedBackButton.show();
        if (this.feedBackNode && cc.isValid(this.feedBackNode)) {
            this.feedBackNode.active = true;
        }
    }

    /**
     * 设置按钮样式
     * @param style
     */
    setButtonStyle(style) {
        if (style.left != undefined)
            this.feedBackButton.style.left = style.left;
        if (style.top != undefined)
            this.feedBackButton.style.top = style.top;
        if (style.width != undefined)
            this.feedBackButton.style.width = style.width;
        if (style.height != undefined)
            this.feedBackButton.style.height = style.height;
        if (style.backgroundColor != undefined)
            this.feedBackButton.style.backgroundColor = style.backgroundColor;
        if (style.borderColor != undefined)
            this.feedBackButton.style.borderColor = style.borderColor;
        if (style.borderWidth != undefined)
            this.feedBackButton.style.borderWidth = style.borderWidth;
        if (style.borderRadius != undefined)
            this.feedBackButton.style.borderRadius = style.borderRadius;
        if (style.textAlign != undefined)
            this.feedBackButton.style.textAlign = style.textAlign;
        if (style.fontSize != undefined)
            this.feedBackButton.style.fontSize = style.fontSize;
        if (style.lineHeight != undefined)
            this.feedBackButton.style.lineHeight = style.lineHeight;
    }


}

let instance = WXFeedBack.getInstance();

module.exports = instance;
