/**
 * 公共组件接口
 */

import { VIEW_SWITCH_TYPE } from "./Comm_Enum";

/**
 * 页面切换传入参数选项
 */
export interface ViewSwitch_Options {
    name: string,
    moveInFunc?: Function,
    moveOutFunc?: Function,
    type?: number,
    solo?: boolean,
}

/**
 * 页面切换的页面属性
 */
export interface ViewSwitch_ViewProp {
    prefab: cc.Prefab,
    instance: cc.Node,
    isMove: boolean,
    name: string,
    solo: boolean,
    switchType: number,
};

/**
 * 页面切换的属性名索引
 */
export interface ViewSwitch_ViewNameMap {
    [propName: string]: ViewSwitch_ViewProp,
};