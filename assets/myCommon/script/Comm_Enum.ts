/**
 * 公共组件枚举
 */

 /**
  * 公共事件名枚举
  */
export enum COMM_EVENT {
    SHOW_TOAST = 'showtoast',       // 显示toast
    SWITCH_VIEW = 'switchView',     // 切换view
    OPEN_MASK = 'openMask',         // 打开遮罩
    CLOSE_MASK = 'closeMask',       // 关闭遮罩
};

// 切换view的方式
export const VIEW_SWITCH_TYPE = cc.Enum({
	MOVE_LEFT: 0,			// 从左边移入移出
	MOVE_RIGHT: 1,		// 从右边移入移出
	HIDE: 2,			// 淡入淡出
});

// 场景切换动作标签
export const ACTION_TAG = -10086;