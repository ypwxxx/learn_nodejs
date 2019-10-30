var FBShare = {
    //邀请好友
    inviteFriend: function(){
        if(typeof FBInstant !== 'undefined'){
            FBInstant.context.chooseAsync()
            .then(function() {
                console.log('邀请好友成功');
            })
        }
    },

    /**
     * 分享
     * @param {string} url 图片的路径
     * @param {string} intent facebook分享类型:'INVITE' | 'REQUEST' | 'CHALLENGE' | 'SHARE'
     * @param {string} title 分享需要传入的文本
     * @param {Object} data 如果需要给分享传入可以用于传输的数据,请按照规范填写,否则传入一个空对象.
     */
    share: function(url,intent,title,data){
        url = url || 'undefined';
        intent = intent || 'SHARE';
        title = title || 'share';
        data = data || new Object();
        if(typeof FBInstant !== 'undefined'){
            let that = this;
            let image = new Image();
            image.crossOrigin = 'anonymous';
            image.src = url;
            image.onload = function(){
                let base64 = that.getBase64Image(image);
                console.log(base64);
                FBInstant.shareAsync({
                    intent: intent,
                    image: base64,
                    text: title,
                    data: data,
                }).catch((e) => {
                    console.log(e);
                });
            }
        }
    },

    //获取base64图片
    getBase64Image: function(img){
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width, img.height);
        var ext = img.src.substring(img.src.lastIndexOf(".")+1).toLowerCase();
        var dataURL = canvas.toDataURL("image/"+ext);
        return dataURL;
    }
};

module.exports = FBShare;