/**
 * 用户数据(读取/保存存档)
 */
export default class FC_UserData {
    private constructor (){};
    private static instance: FC_UserData = null;
    public static getInstance(): FC_UserData{
        this.instance = this.instance ? this.instance : new FC_UserData();
        return this.instance;
    };

    
}
