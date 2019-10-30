
interface reportType{
    event:string,
    label:string,
    date:string
};
interface dataType{
    appId:string,
    chnl:string,
    installVer:string,
    appVer:string,
    devType:string,
};

export function initDate(obj:dataType){
    return { type: "INIT_DATA",obj}
};
export function initLastData(obj) {
    return { type: "INIT_LASTDATA",obj}
}
export function updateTime(){
    return { type: "TIME_UPDATE"}
};
export function addTime(obj:reportType){
    return { type: "TIME_ADD",obj}
};
export function addCount(obj:reportType){
    return { type: "COUNT_ADD",obj}
};
export function updateCount(index){
    return { type: "COUNT_UPDATE",index}
};
export function stopTime(index){
    return { type: "TIME_STOP",index}
};
export function successUpload(){
    return { type: "UPLOAD_SUCCESS"}
}





