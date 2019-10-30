import {combineReducers} from 'Redux'

const initialState = {
    finish: [],
    process: [],
    second:0
};
const initialData={
    appId:null,
    chnl:null,
    installVer:null,
    appVer:null,
    pkg:" ",
    devType:null,
    osVer:0,
    uuid:null,
};

function count(state = initialState, action) {
    const {finish, process,second} = state;

    switch (action.type) {
        case "INIT_LASTDATA":
            return action.obj;
        case "TIME_ADD":
            let [...timeNow] = process
            let timeObj = action.obj
            let time = {
                event: timeObj.event,
                label: timeObj.label,
                times: 0,
                du: 0,
                date: timeObj.date
            };
            timeNow.push(time)
            return Object.assign({}, state, {
                process: timeNow,
            })
        case "COUNT_ADD":
            let [...countNow] = finish
            let countObj = action.obj
            let counts = {
                event: countObj.event,
                label: countObj.label,
                times: 1,
                du: 0,
                date: countObj.date
            };
            countNow.push(counts)
            return Object.assign({}, state, {
            finish: countNow,
        })
        case "TIME_UPDATE":
            let currentTime=second
            currentTime=currentTime+100
            let updateTime= state.process;
            if (updateTime) {
                for (let key in updateTime) {
                    updateTime[key].du += 100
                }
            };
            return Object.assign({}, state, {
                process: updateTime,
                second:currentTime
            })
        case "COUNT_UPDATE":
            let [...updateCount] = finish;
            if (updateCount) {
                updateCount[action.index].times += 1
            };
            return Object.assign({}, state, {
                finish: updateCount,
            })
        case "TIME_STOP":
            let [...stop1]=finish;
            let [...stop2]=process;
            stop1.push(process[action.index])
            stop2.splice(action.index,1)
            return Object.assign({}, state, {
                    finish: stop1,
                    process: stop2,
            })
        case "UPLOAD_SUCCESS":
            let [...success]=process;
            for(let k in success){
                success[k].du=0
            }
            localStorage.removeItem("LastData")
            return Object.assign({}, initialState, {
                process: success,
                finish:[]
            });
        default:
            return state;
    }
};
function data(state = initialData, action){
    let obj=action.obj;
    switch (action.type) {
        case "INIT_DATA":
            return {
                ...initialData,
                appId: obj.appId,
                chnl: obj.chnl,
                installVer: obj.installVer,
                appVer: obj.appVer,
                devType: obj.devType,
                osVer:obj.osVer,
            };
        default:
            return state;
    }
};
const todoApp = combineReducers({
    count,
    data
})

export default todoApp;