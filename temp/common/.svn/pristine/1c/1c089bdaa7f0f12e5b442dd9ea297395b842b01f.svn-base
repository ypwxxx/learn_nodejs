var Record = {
    TTRecord: null,
    recordState: 1,  //1:未开始,2:录制中
    recordNode: null,
    initPos: null,
    videoPath: null,        // 视频路径
    onShareCallfuncs: null,      // 监听分享回调
    isReset: null,           // 是否重置
    isShare: null,            // 是否立即执行分享
    onReset: null,            // 重置回调
    startTime: null,
    stopTime: null,             // 停止视频的时间
    recordTime:0,          //中途暂停，记录已录屏时间长度.默认为0
    /**
     obj:{onStart:function ,onStop:function}
     **/
    init: function (obj) {
        if (!this.TTRecord) {
            this.isReset = false;
            this.isShare = true;
            // this.stopTime = new Date().getTime();
            this.onReset = obj.onReset;

            let record = tt.getGameRecorderManager();
            
            record.onPause(()=>{
                this.recordTime = new Date().getTime() - this.startTime;
                console.log('暂停录屏。。。')
            })
            record.onResume(()=>{
                this.startTime = new Date().getTime();
                console.log('恢复录屏。。。')
            })
            this.TTRecord = record;
            if (obj.recordNode) {
                this.recordNode = obj.recordNode;
                this.initPos = this.recordNode.getPosition();
            }
            record.onStart(res => {
                obj.onStart && obj.onStart();
                this.recordState = 2;
                this.recordTime = 0;
                this.startTime = new Date().getTime();
            });
            record.onStop(res => {
                this.recordState = 1;
                obj.onStop && obj.onStop();
                this.stopTime = new Date().getTime();
                if(this.isReset){
                    this.isReset = false;
                }else{
                    this.videoPath = res.videoPath;

                    if(this.isShare){
                        this.share({isCallback: true});
                    }else{
                        this.isShare = true;
                    }
                }
            });
            record.onError(errMsg => {
                console("TTRecord errMsg:", JSON.stringify(errMsg));
            });
        }
    },
    /*
    * obj{x:number,y:number},不传入坐标则是还原为初始的位置
    * */
    fixPos: function (obj) {
        if (!this.recordNode) return;
        if (obj) {
            // this.recordNode.x = obj.x + 360;
            // this.recordNode.y = obj.y + 780;
            this.recordNode.x = obj.x;
            this.recordNode.y = obj.y;
        } else {
            this.recordNode.setPosition(this.initPos);
        }
    },

    // 开始录屏
    startVideo: function(){
        this.TTRecord.start({
            duration: 300,
        });
    },

    // 停止video
    stopVideo: function(options){
        this.isShare = (options && typeof options.isShare == 'boolean') ? options.isShare : true;

        if(this.TTRecord._recording){
            this.videoPath = '';
            if(this.TTRecord){
                // this.stopTime = new Date().getTime();
                this.TTRecord.stop();
            }
        }
    },

    /**
     * 监听分享
     * @param {*} callbacks {pause: Function, resume: Function}
     */
    onShare: function(callbacks){
        this.onShareCallfuncs = callbacks;
    },

    // 取消监听
    offShare: function(){
        this.onShareCallfuncs = null;
    },

    // 隐藏
    hideNode: function(){
        this.recordNode.x = this.initPos.x + 3000;
    },

    // 显示
    showNode: function(){
        this.recordNode.x = this.initPos.x;
    },

    // 重置
    reset: function(options){
        let isHide = (options && typeof options.isHide == 'boolean') ? options.isHide : false;      // 默认不隐藏  
        this.isReset = true;
        this.isShare = false;

        if(this.TTRecord && this.TTRecord._recording){
            this.TTRecord.stop();
        }else{
            this.isReset = false;
            this.isShare = true;
        }
        this.videoPath = '';
        this.recordState = 1;
        this.onShareCallfuncs = null;
        if(typeof this.onReset == 'function'){
            this.onReset();
        }

        if(isHide){
            this.hideNode();
        }else{
            this.showNode();
        }
    },

    share: function(options){
        let isCallback = (options && typeof options.isCallback == 'boolean') ? options.isCallback : true;

        // if(this.stopTime < this.TTRecord._st){
        //     this.stopTime = new Date().getTime();
        // }
        if (this.stopTime - this.startTime + this.recordTime <= 3000) {
            tt.showToast({
                title: "录制时间过短",
                icon: 'none'
            });
            return;
        } else {
            if(this.onShareCallfuncs && this.onShareCallfuncs.pause && typeof this.onShareCallfuncs.pause == 'function' && isCallback){
                this.onShareCallfuncs.pause();
            }

            console.log('videoPath: ', this.videoPath);
            tt.shareVideo({
                videoPath: this.videoPath,
                success:() => {
                    console.log(`分享成功!`);
                    if(this.onShareCallfuncs && this.onShareCallfuncs.resume && typeof this.onShareCallfuncs.resume == 'function' && isCallback){
                        this.onShareCallfuncs.resume();
                    }
                },
                fail:(e) => {
                    console.log(`分享失败!` + JSON.stringify(e));
                    tt.showToast({
                        title: "分享失败!",
                        icon: 'none'
                    });
                    if(this.onShareCallfuncs && this.onShareCallfuncs.resume && typeof this.onShareCallfuncs.resume == 'function' && isCallback){
                        this.onShareCallfuncs.resume();
                    }
                }
            });
        }
    },
};

module.exports = Record;