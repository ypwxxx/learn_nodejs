const Stat = require("Statistics");


var moreGameCore={
    event: null,
    registerSkipStatEvent:()=>{
        if (!moreGameCore.event) moreGameCore.event = new cc.EventTarget();
        moreGameCore.event.off("skipSuccess_demo");
        moreGameCore.event.on("skipSuccess_demo",  (event)=> {
            if(!event) return;
            for(let i=0;i<=1;i++){
                if(event[i]){
                    let firstClick = cc.sys.localStorage.getItem(event[i]);
                    if (!firstClick) {
                        //cc.sys.localStorage.setItem(event[i], "true");
                        wx.setStorage({key:event[i], data:"true"})
                        Stat.reportEventNow("success", event[i]);
                    }
                }
            }
        });
    }
}

module.exports = moreGameCore;