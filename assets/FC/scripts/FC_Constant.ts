// 常量

/**
 * 方向
 */
export enum DIRECTION {
    UP,
    DOWN,
    LEFT,
    RIGHT
};

/**
 * 颜色
 */
export enum COLOR {
    RED,
    YELLOW,
    BLUE,
    GREEN
};

/**
 * 飞机类型
 */
export enum PLANE_TYPE {
    RED,
    YELLOW,
    BLUE,
    GREEN
};

/**
 * 玩家类型
 */
export enum PLAYER_TYPE {
    NONE,       // 无
    ONLINE,     // 线上真人
    OFFLINE,    // 线下真人
    AI          // 电脑
};

/**
 * 指令
 */
export const COMMAND_PLANE = {
    set_skin: 'set_skin',       // 设置皮肤
    set_pos: 'set_pos',         // 设置位置
    move_step_to: 'move_step_to',     // 移动到
    play_anim_standby_choose: 'play_anim_standby_choose',       // 播放待选中动画
    feedback_pos: 'feedback_pos',       // 反馈位置
};