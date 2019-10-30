const CCGlobal = require('CCGlobal')
const CCConst = require('CCConst')
var WXGameClub = {
    gameClubButton: null,
    createGameClubButton: function (object) {
        if (CCGlobal.platform == CCConst.PLATFORM.WEIXIN && CCGlobal.apiVer > "2.0.2") {
            this.destroyGameClubButton();
            this.gameClubButton = wx.createGameClubButton(object);
        }
    },
    hideGameClubButton: function () {
        if (this.gameClubButton)
            this.gameClubButton.hide();
    },
    destroyGameClubButton: function () {
        if (this.gameClubButton)
            this.gameClubButton.destroy();
    },
    showGameClubButton: function () {
        if (this.gameClubButton)
            this.gameClubButton.show();
    },
    setButtonStyle: function (style) {
        if (style.left != undefined)
            this.gameClubButton.style.left = style.left;
        if (style.top != undefined)
            this.gameClubButton.style.top = style.top;
        if (style.width != undefined)
            this.gameClubButton.style.width = style.width;
        if (style.height != undefined)
            this.gameClubButton.style.height = style.height;
        if (style.backgroundColor != undefined)
            this.gameClubButton.style.backgroundColor = style.backgroundColor;
        if (style.borderColor != undefined)
            this.gameClubButton.style.borderColor = style.borderColor;
        if (style.borderWidth != undefined)
            this.gameClubButton.style.borderWidth = style.borderWidth;
        if (style.borderRadius != undefined)
            this.gameClubButton.style.borderRadius = style.borderRadius;
        if (style.textAlign != undefined)
            this.gameClubButton.style.textAlign = style.textAlign;
        if (style.fontSize != undefined)
            this.gameClubButton.style.fontSize = style.fontSize;
        if (style.lineHeight != undefined)
            this.gameClubButton.style.lineHeight = style.lineHeight;
    }

};

module.exports = WXGameClub;