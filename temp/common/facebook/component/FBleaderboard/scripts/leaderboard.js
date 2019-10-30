/**
 * facebook排行榜组件 version 1.0.5
 * @version 1.0.5 update explanation
 * 1.修复显示上一个即将超越的玩家的时候,没有进行排行榜数据更新的bug
 * 
 * @version 1.0.4 update explanation
 * 1.修复排行榜的初始化排名错误
 * 
 * @version 1.0.3 update explanation
 * 1.修复排行榜的显示bug
 * 
 * @version 1.0.2 update explanation
 * 1.修复显示'即将超越好友'节点后不消失的bug.
 * 2.修改三人排行榜排列方式.
 * 3.添加隐藏'即将超越好友'节点的hide方法.
 * 
 * @version 1.0.1 update explanation
 * 1.更新了一个hideRank的方法,用于隐藏所有排行榜,同时屏蔽了原本在simpleRank界面跳转场景按钮会调用的排行榜隐藏的代码
 * 现在,请在自己的脚本中合适的位置调用隐藏方法.(主要是由于在切换场景是立马调用隐藏排行榜的方法,会导致排行榜先于场景
 * 消失,所以现在将这个方法单独拿出来使用).
 * 2.删除了以前测试阶段使用的控制台简陋代码,现在facebook打包的时候可以选择打入一个控制台工具,不再需要以前的方法来进行
 * 调试.
 * 3.添加了游戏开始的rank初始化,主要是隐藏不需要显示node
 * 4.在initLB方法中添加了一个返回值,返回排行榜组件的this,现在可以直接用这个this来调用方法.
 * 5.修复showSimpleRank方法可能导致的,刷新排行榜后,新的好友不会显示的bug
 * 6.修复其他若干小bug
 * 
 * @version 1.0.0 explanation
 * 1.使用时请先初始化(initLB)
 * 2.初始化需要时间,尽量不要在初始化后立马调用show方法.
 * 3.showFullRank和showSimpleRank分别可以调出两种排行榜,注意需要传入的参数
 * 4.另外提供调用'下一个超越的好友'和获取自己在排行榜分数的方法,调用需要注意返回的参数,必要时最好判断返回的值再使用
 * 5.每次对该组件修改后,在最上面添加上修改的内容,并顺序递增版本
 */



cc.Class({
    extends: cc.Component,
    properties: {
        simpleView: cc.Node,
        fullView: cc.Node,
        score: cc.Label,
        bestScore: cc.Label,
        simpleRank: {
            default: [],
            type: cc.Node
        },
        fullRank: {
            default: [],
            type: cc.Node
        },
        userRank: cc.Node,
        LBTitle: cc.Label,
        upPageNode: cc.Node,
        downPageNode: cc.Node,

        passNode: cc.Node,
        passPhoto: cc.Sprite,
        passScore: cc.Label,

        errorTip: cc.Label,
    },

    onLoad () {
        this.fullRankState = false;     //主玩法的状态,true代表由主玩法进入,false代表子玩法进入
        this.canFlushLB = true;         //标记是否可以刷新排行榜 true能,false不能
        this.flushLBTime = 300;         //每五分钟刷新一次排行榜
        this.timeID = null,
        this.curLB = '';                //当前排行榜
        this.curPage = 0;               //当前排行榜页面
        this.normalColor = '#FFFFFF';          //普通的颜色
        this.userColor = '#5DC800';     //自己排名的颜色
        this.rankColor = ["#EF8009", "#EFC725", "#E5D122"];     //前三排名的颜色
        this.allLBName = new Object();          //缓存各个排行榜的英文名字
        this.pageState = new Object();         //标记不同排行榜的翻页按钮的状态,true代表可点击,false代表不可点击 {'key1': false, 'key2': false, ...}
        this.playerCount = new Object();    //缓存所有排行榜的玩家数量  {'key1': count, 'key2': count, ...}
        this.allLBData = new Object();      //缓存所有排行榜的数据 {'key1': [{rank:,photo:,name:,score:},{rank:,photo:,name:,score:},...],'key2': [{rank:,photo:,name:,score:},{rank:,photo:,name:,score:},...],...}
        this.userData = new Object();       //缓存玩家各排行榜数据 {'key1': {rank: , photo: , name: , score: }, 'key1': {rank: , photo: , name: , score: }, ...}
        this.LBArray = new Array();         //缓存所有排行榜的key
        this.LB = new Object();             //标记排行榜的调用

        this.shareHandler = null;           //标记分享函数
        this.challengeHandler = null;       //标记挑战函数
        this.showoffHandler = null;         //标记炫耀函数
        this.replayHandler = null;          //标记重玩函数
        this.returnMainHandler = null;      //标记返回主页函数


        //节点初始化
        for(let i = 0; i < this.simpleRank.length; i++){
            this.simpleRank[i].getChildByName('rank').opacity = 0;
            this.simpleRank[i].getChildByName('image').opacity = 0;
            this.simpleRank[i].getChildByName('name').opacity = 0;
            this.simpleRank[i].getChildByName('score').opacity = 0;
        }

        for(let i = 0; i < this.fullRank.length; i++){
            this.fullRank[i].getChildByName('rank').opacity = 0;
            this.fullRank[i].getChildByName('image').opacity = 0;
            this.fullRank[i].getChildByName('name').opacity = 0;
            this.fullRank[i].getChildByName('score').opacity = 0;
        }

        cc.game.addPersistRootNode(this.node);          //设置排行榜节点为常驻节点
        this.setNodeSize();                 
    },

    start () {
        this.timeID = setTimeout(this.flushLB.bind(this), this.flushLBTime * 1000);
        // this.schedule(this.flushLB.bind(this),1,cc.repeatForever,10);
    },

    //设置节点的高度自适应
    setNodeSize: function(){
        let frameH = cc.game.canvas.height;
        let frameW = cc.game.canvas.width;
        let h = this.node.width * (frameH / frameW);
        this.node.height = h;
        this.node.y = h / 2;
    },

    //定时刷新排行榜
    flushLB: function(){
        this.canFlushLB = true;
        this.SaveAllData(this.LBArray);
        clearTimeout(this.timeID);
        this.timeID = setTimeout(this.flushLB.bind(this), this.flushLBTime * 1000);
        // this.flushLBTime--;
        // if(this.flushLBTime === 0){
        //     this.canFlushLB = true;
        //     this.flushLBTime = 180;
        //     this.SaveAllData(this.LBArray);
        // }
    },

    /**
     * 初始化
     * @param {object} option 游戏玩法对象,key是游戏的key,game_name是游戏的英文名,用于排行榜的命名 {'key1': 'game_name','key2': 'game_name',...}
     * @return {Promise} 返回一个promise,可以用于获取需要在排行榜加载完成以后的数据
     */
    initLB: function(option){
        for(let i in option){
            if(option.hasOwnProperty(i)){
                this.LB[i] = null;
                this.allLBName[i] = option[i];
                this.LBArray.push(i);
            }
        }
        console.log('准备初始化');
        this.SaveAllData(this.LBArray); 
        // FBInstant.startGameAsync().then(() => {
        //     this.SaveAllData(this.LBArray); 
        //     this.LBerrInfo = '';
        // }, err => {
        //     console.log('startGameAsync准备出错',err);
        //     this.LBerrInfo = 'Failure to load the list...';
        // })

        return this;
    },

    /**
     * 缓存所有数据
     * @param {array} option 游戏玩法key数组 ['key1','key2',...]
     * 
     */
    SaveAllData: function(option){
        if(!this.canFlushLB) return;
        this.canFlushLB = false;
        for(let i = 0; i < option.length; i++){
            let curKey = option[i];
            this.scheduleOnce(() => {
                if(this.LB[curKey] == null){
                    FBInstant.getLeaderboardAsync('Globle' + curKey).then(leaderboard => {
                        this.LB[curKey] = leaderboard;
                        this.LBerrInfo = '';
                        return this.LB[curKey].getConnectedPlayerEntriesAsync();
                    }, err => {
                        console.log('获取' + curKey + '排行榜失败,错误: ',err);
                        this.LBerrInfo = 'Failure to get the list...';
                    }).then(entries => {
                        this.LBerrInfo = '';
                        let playerData = this.checkPlayerInLeaderboard(entries,FBInstant.player.getID());
                        this._saveOtherData(entries, this.allLBData, curKey);
                        if(playerData == false){
                            let photoUrl = FBInstant.player.getPhoto();
                            let data = {
                                rank: entries.length + 1,
                                name: FBInstant.player.getName(),
                                photo: photoUrl,
                                score: 0,
                                id: FBInstant.player.getID(),
                            };
                            this._saveSelfData(data,this.userData,curKey);
                            let count = entries.length;
                            if(!Array.isArray(this.allLBData[curKey])){
                                this.allLBData[curKey] = new Array();
                            }
                            this.playerCount[curKey]++;
                            this.pageState[curKey] = this.playerCount[curKey] <= 6 ? false : true;
                            if(typeof this.allLBData[curKey][count] !== 'object'){
                                this.allLBData[curKey][count] = new Object();
                            }
                            this.allLBData[curKey][count].rank = data.rank;
                            cc.loader.load(photoUrl,(err,texture) => {
                                this.allLBData[curKey][count].photo = new cc.SpriteFrame(texture);
                            });
                            this.allLBData[curKey][count].name = data.name;
                            this.allLBData[curKey][count].score = 0;
                            this.allLBData[curKey][count].id = data.id;
                            this._initPlayerScore(this.LB[curKey]);
                        }else{
                            this._saveSelfData(playerData,this.userData,curKey);
                        }
                    }, err => {
                        console.log('获取' + curKey + '所有用户信息失败,错误: ',err);
                        this.LBerrInfo = 'Gain player information failure...';
                    })
                }else{
                    console.log(curKey + 'LB已初始化');
                    this.LB[curKey].getConnectedPlayerEntriesAsync().then(entries => {  
                        this.LBerrInfo = ''; 
                        this._saveOtherData(entries, this.allLBData, curKey);
                        let playerData = this.checkPlayerInLeaderboard(entries,FBInstant.player.getID());
                        this._saveSelfData(playerData,this.userData,curKey);
                    }, err => {
                        console.log('获取'+curKey + '所有用户信息失败', err);
                        this.LBerrInfo = 'Gain player information failure...';
                    })
                }
            },i);
        }
    },

    /**
     * 初始化玩家分数
     * @param {leaderboard} leaderboard 排行榜
     */
    _initPlayerScore: function(leaderboard){
        leaderboard.setScoreAsync(0).then(entry => {
            console.log('成功初始化玩家分数');
        }, err => {
            console.log('初始化玩家分数失败,错误: ',err);
        })
    },

    /**
     * 缓存用户自身数据
     * @param {entry} entry 由facebook发送回来的玩家数据
     * @param {{Object}} selfData 缓存玩家数据的容器
     * @param {string} key 指定排行榜的key
     */
    _saveSelfData: function(entry, selfData, key){
        console.log('获取用户' + key + '分数成功');
        if(typeof selfData[key] !== 'object'){
            selfData[key] = new Object();
        }
        selfData[key].rank = entry.rank;
        let photoUrl = entry.photo;
        cc.loader.load(photoUrl,(err,texture) => {
            selfData[key].photo = new cc.SpriteFrame(texture);
        });
        selfData[key].name = entry.name;
        selfData[key].score = entry.score;
        selfData[key].id = entry.id;
        console.log('用户本人数据:', this.userData);
    },

    /**
     * 缓存其他用户数据
     * @param {entries} entries 由facebook发送回来的指定排行榜的数据
     * @param {{[Object]}} otherData 缓存玩家的容器
     * @param {string} key 指定排行榜的key
     */
    _saveOtherData: function(entries,otherData, key){
        console.log('获取到' + key + '所有玩家数据');
        let count = entries.length;
        if(!Array.isArray(otherData[key])){
            otherData[key] = new Array(count);
        }
        this.playerCount[key] = count;
        this.pageState[key] = count <= 6 ? false : true;
        for(let j = 0; j < count; j++){
            if(typeof otherData[key][j] !== 'object'){
                otherData[key][j] = new Object();
            }
            otherData[key][j].rank = entries[j].getRank();
            let photoUrl = entries[j].getPlayer().getPhoto();
            cc.loader.load(photoUrl,(err,texture) => {
                otherData[key][j].photo = new cc.SpriteFrame(texture);
            });
            otherData[key][j].name = entries[j].getPlayer().getName();
            otherData[key][j].score = entries[j].getScore();
            otherData[key][j].id = entries[j].getPlayer().getID();
        }
        console.log(key + '的所有用户信息:', this.allLBData);
    },

    /**
     * 显示三人排行界面
     * @param {Object} options 
     * {
     *  {int} newScore: 本次得分
     *  {function} onShare:点击分享
     *  {function} onChallenge:点击发起挑战
     *  {function} onReplay:点击重玩
     *  {function} onReturnMain:点击返回首页
     *  {function} onShowOff: 点击炫耀一下
     *  {string} key:玩法key
     * }
     */
    showSimpleRank: function(options){
        this.curLB = options.key;
        this._updateLocalData(this.curLB, options.newScore);
        this._flushSimpleLB(this.curLB,options);
        if(this.LBerrInfo === ''){
            this.simpleView.x = 0;
            this.errorTip.x = -1000;
        }else{
            this.simpleView.x = 1000;
            this.errorTip.x = 0;
        }
    },

    /**
     * 刷新三人排行榜
     * @param {string} LBKey 需要刷新的排行榜key
     * @param {Object} options 传入的需要绑定的数据
     */
    _flushSimpleLB: function(LBKey, options){
        let rankArr = new Array(3);
        if(this.userData[LBKey].rank == 1){
            for(let i = 0; i < 3; i++){
                if(i < this.playerCount[LBKey]){
                    rankArr[i] = new Object();
                    rankArr[i].rank = this.allLBData[LBKey][i].rank;
                    rankArr[i].photo = this.allLBData[LBKey][i].photo;
                    rankArr[i].name = this.allLBData[LBKey][i].name;
                    rankArr[i].score = this.allLBData[LBKey][i].score;
                }else{
                    rankArr[i] = null;
                }
            }
        }else if(this.userData[LBKey].rank == this.playerCount[LBKey] && this.playerCount[LBKey] > 1){
            for(let i = 0; i < 3; i++){
                let tNum = this.playerCount[LBKey] - 3 + i;
                if(tNum >= 0){
                    rankArr[i] = new Object();
                    rankArr[i].rank = this.allLBData[LBKey][tNum].rank;
                    rankArr[i].photo = this.allLBData[LBKey][tNum].photo;
                    rankArr[i].name = this.allLBData[LBKey][tNum].name;
                    rankArr[i].score = this.allLBData[LBKey][tNum].score;
                }else{
                    rankArr[i] = null;
                }
            }
        }else{
            for(let i = 0,j = this.userData[LBKey].rank - 2; i < 3; i++, j++){
                rankArr[i] = new Object();
                rankArr[i].rank = this.allLBData[LBKey][j].rank;
                rankArr[i].photo = this.allLBData[LBKey][j].photo;
                rankArr[i].name = this.allLBData[LBKey][j].name;
                rankArr[i].score = this.allLBData[LBKey][j].score;
            }
        }
        for(let i = 0; i < 3; i++){
            if(rankArr[i] != null){
                this.simpleRank[i].getChildByName('rank').getComponent(cc.Label).string = rankArr[i].rank;
                this.simpleRank[i].getChildByName('image').getComponent(cc.Sprite).spriteFrame = rankArr[i].photo;
                this.simpleRank[i].getChildByName('name').getComponent(cc.Label).string = rankArr[i].name;
                this.simpleRank[i].getChildByName('score').getComponent(cc.Label).string = rankArr[i].score;
                this.simpleRank[i].getChildByName('rank').opacity = 255;
                this.simpleRank[i].getChildByName('image').opacity = 255;
                this.simpleRank[i].getChildByName('name').opacity = 255;
                this.simpleRank[i].getChildByName('score').opacity = 255;
            }else{
                this.simpleRank[i].getChildByName('rank').opacity = 0;
                this.simpleRank[i].getChildByName('image').opacity = 0;
                this.simpleRank[i].getChildByName('name').opacity = 0;
                this.simpleRank[i].getChildByName('score').opacity = 0;
            }
        }
        if(options && options.newScore){
            this.score.string = options.newScore;
        }

        this.bestScore.string = 'Best:' + this.userData[LBKey].score;

        //绑定按钮事件
        if(options && options.onShare && typeof options.onShare === "function"){
            this.shareHandler = options.onShare;
        }
        if(options && options.onChallenge && typeof options.onChallenge === "function"){
            this.challengeHandler = options.onChallenge;
        }
        if(options && options.onReturnMain && typeof options.onReturnMain === "function"){
            this.returnMainHandler = options.onReturnMain;
        }
        if(options && options.onReplay && typeof options.onReplay === "function"){
            this.replayHandler = options.onReplay;
        }
        if(options && options.onShowOff && typeof options.onShowOff === "function"){
            this.showoffHandler = options.onShowOff;
        }

        //移开passNode
        this.passNode.y = 1000;
    },

    /**
     * 转到全排行
     * @param {string} key 想要显示的排行榜的key
     * @param {boolean} state true代表主玩法排行榜,false代表游戏内排行榜
     */
    showFullRank: function(key,state){
        this.fullRankState = state;
        this.curPage = 1;
        this.curLB = key;
        this.flushFullRank(this.curLB, this.curPage);
    },

    /**
     * 显示全排行榜界面
     * @param {string} key 当前显示的排行榜key
     * @param {number} page 当前显示的排行榜的第几页
     */
    flushFullRank: function(key,page){
        if(!this.pageState[key]){
            this.upPageNode.getChildByName('image').color = new cc.Color(100,100,100);
            this.downPageNode.getChildByName('image').color = new cc.Color(100,100,100);
        }else{
            this.upPageNode.getChildByName('image').color = new cc.Color(255,255,255);
            this.downPageNode.getChildByName('image').color = new cc.Color(255,255,255);
        }

        this.LBTitle.string = this.allLBName[key];
        this.userRank.getChildByName('rank').getComponent(cc.Label).string = this.userData[key].rank;
        this.userRank.getChildByName('image').getComponent(cc.Sprite).spriteFrame = this.userData[key].photo;
        this.userRank.getChildByName('name').getComponent(cc.Label).string = this.userData[key].name;
        this.userRank.getChildByName('score').getComponent(cc.Label).string = this.userData[key].score;

        let count = this.playerCount[key];
        for(let i = 0, j = (page - 1) * 6; i < 6; i++, j++){
            if(j < count){
                this.fullRank[i].getChildByName('rank').getComponent(cc.Label).string = this.allLBData[key][j].rank;
                this.fullRank[i].getChildByName('image').getComponent(cc.Sprite).spriteFrame = this.allLBData[key][j].photo;
                this.fullRank[i].getChildByName('name').getComponent(cc.Label).string = this.allLBData[key][j].name;
                this.fullRank[i].getChildByName('score').getComponent(cc.Label).string = this.allLBData[key][j].score;
                this.fullRank[i].getChildByName('rank').opacity = 255;
                this.fullRank[i].getChildByName('image').opacity = 255;
                this.fullRank[i].getChildByName('name').opacity = 255;
                this.fullRank[i].getChildByName('score').opacity = 255;
            }else{
                this.fullRank[i].getChildByName('rank').opacity = 0;
                this.fullRank[i].getChildByName('image').opacity = 0;
                this.fullRank[i].getChildByName('name').opacity = 0;
                this.fullRank[i].getChildByName('score').opacity = 0;
            }
        }
        //转换颜色
        for(let i = 0; i < 6; i++){
            this.fullRank[i].getChildByName('rank').color = new cc.Color().fromHEX(this.normalColor);
            this.fullRank[i].getChildByName('name').color = new cc.Color().fromHEX(this.normalColor);
            this.fullRank[i].getChildByName('score').color = new cc.Color().fromHEX(this.normalColor);
        }

        if(this.userData[key].rank > (page - 1) * 6 && this.userData[key].rank <= page * 6){
            let temp = this.userData[key].rank % 6;
            let index = temp === 0 ? 5 : (temp - 1);
            this.fullRank[index].getChildByName('rank').color = new cc.Color().fromHEX(this.userColor);
            this.fullRank[index].getChildByName('name').color = new cc.Color().fromHEX(this.userColor);
            this.fullRank[index].getChildByName('score').color = new cc.Color().fromHEX(this.userColor);
        }
        if(page == 1){
            for(let i = 0; i < 3; i++){
                this.fullRank[i].getChildByName('rank').color = new cc.Color().fromHEX(this.rankColor[i]);
                this.fullRank[i].getChildByName('name').color = new cc.Color().fromHEX(this.rankColor[i]);
                this.fullRank[i].getChildByName('score').color = new cc.Color().fromHEX(this.rankColor[i]);
            }
        }
        if(this.LBerrInfo === ''){
            this.fullView.x = 0;
            this.errorTip.x = -1000;
        }else{
            this.fullView.x = 1000;
            this.errorTip.x = 0;
        }

        //移开passNode
        this.passNode.y = 1000;
    },

    /**
     * 更新本地缓存数据
     * @param {string} key 游戏的key
     * @param {number} score 游戏获得的分数
     */
    _updateLocalData: function(key, score){
        //更改本地缓存的玩家数据
        if(score > this.userData[key].score){
            this.userData[key].score = score;
            this.setScoreByRank(key, this.userData[key].rank, score);
            this.allLBData[key].sort(this.compare('score'));
            for(let i = 0; i < this.allLBData[key].length; i++){
                this.allLBData[key][i].rank = i + 1;
                if(this.allLBData[key][i].id == this.userData[key].id){
                    this.userData[key].rank = this.allLBData[key][i].rank;
                }
            }
            //上传新的最高分
            this.LB[key].setScoreAsync(score).then(entry => {
                this.canFlushLB = true;
                this.SaveAllData([key]);
            }).catch(err => {
                console.log('上传分数出错: ', err);
            });
        }
    },

    /**
     * 获取自己的上一名玩家的数据
     * @param {string} key 要获取的排行榜的key
     * @return {objest} 如果数据存在,返回上一个玩家的数据,否则返回false
     */
    _getForwardData: function(key){
        if(this.userData[key].rank == 1) return false;
        let index = this.userData[key].rank - 2;
        let data = this.allLBData[key][index];
        if(data){
            return data;
        }else{
            return false;
        }
    },

    /**
     * 显示即将超越的好友
     * @param {string} key 游戏的key
     * @param {number} score 本次游戏获得的分数
     * @param {number} height 想要显示的位置
     */
    showPassNext: function(key ,score, height){
        this._updateLocalData(key, score);
        let data = this._getForwardData(key);
        if(!!data){
            this.passPhoto.spriteFrame = data.photo;
            this.passScore.string = data.score;
            this.passNode.y = height;
        }else{
            this.passNode.y = 1000;
        }
    },

    /**
     * 获取用户最高分
     * @param {string} key 要获取的排行榜的key
     */
    getUserBest: function(key){
        if(this.userData&&this.userData[key]&&this.userData[key].score){
            return Number(this.userData[key].score);
        }
        return null;
    },

    //隐藏排行榜
    hideRank: function(){
        this.simpleView.x = 1000;
        this.fullView.x = 2000;
    },

    //隐藏即将超越的好友
    hidePassFriend: function(){
        this.passNode.y = 1000;
    },

    //排行榜上翻页
    upPageBtn: function(){
        if(!this.pageState[this.curLB]) return;
        if(this.curPage === 1) return;
        this.curPage--;
        this.flushFullRank(this.curLB,this.curPage);
    },

    //排行榜下翻页
    downPageBtn: function(){
        if(!this.pageState[this.curLB]) return;
        if(this.curPage >= Math.ceil(this.playerCount[this.curLB] / 6)) return;
        this.curPage++;
        this.flushFullRank(this.curLB,this.curPage);
    },

    //share按钮
    shareBtn: function(){
        this.shareHandler();
    },

    //炫耀按钮
    showoffBtn: function(){
        this.showoffHandler();
    },

    //挑战按钮
    challengeBtn: function(){
        this.challengeHandler();
    },

    //返回主菜单按钮
    returnMainBtn: function(){
        this.returnMainHandler();
    },

    //重玩按钮
    replayBtn: function(){
        this.replayHandler();
    },

    //从三人转翻页排行榜
    toFullRankBySimple: function(){
        this.curPage = 1;
        this.fullRankState = false;
        this.flushFullRank(this.curLB,this.curPage);
        this.simpleView.x = 1000;
    },

    //从全排行转三人排行榜
    toSimpleByFullRank: function(){
        if(!this.fullRankState) {
            this.simpleView.x = 0;
        }
        this.fullView.x = 1000;
        this._flushSimpleLB(this.curLB);
    },

    /**
     * 根据排名修改排行榜分数
     * @param {string} key 排行榜key
     * @param {number} index 待寻找的玩家的排名
     * @param {number} aimScore 要修改成的分数
     */
    setScoreByRank: function(key, index, aimScore){
        for(let i = 0; i < this.allLBData[key].length; i++){
            if(this.allLBData[key][i].rank == index){
                this.allLBData[key][i].score = aimScore;
            }
        }
    },

    /**
     * 排序方法
     * @param {string} prop 根据prop来确定需要以对象的什么属性来排序
     */
    compare: function(prop){
        return function(obj1, obj2){
            let val1 = Number(obj1[prop]);
            let val2 = Number(obj2[prop]);
            if(val1 > val2){
                return -1;
            }else if(val1 < val2){
                return 1;
            }else{
                return 0;
            }
        }
    },

    /**
     * 检查当前排行榜中是否存在玩家
     * @param {leaderboard} checkLB 待检查的排行榜
     * @param {string} checkPlayerID 待检查的玩家ID
     * @return {object} 如果检查到玩家,则返回玩家相关数据的对象,否则返回false
     */
    checkPlayerInLeaderboard: function(checkLB,checkPlayerID){
        let count = checkLB.length;
        for(let i = 0; i < count; i++){
            if(checkLB[i].getPlayer().getID() == checkPlayerID){
                let playerData = {
                    rank: checkLB[i].getRank(),
                    name: checkLB[i].getPlayer().getName(),
                    photo: checkLB[i].getPlayer().getPhoto(),
                    score: checkLB[i].getScore(),
                    id: checkPlayerID,
                }
                return playerData;
            }
        }
        console.log('当前排行榜中不存在玩家');
        return false;
    },

    //点击无效
    clickNo: function(){

    },
    

    // update (dt) {},
});
