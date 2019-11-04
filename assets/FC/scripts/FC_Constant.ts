// 常量

// 飞行棋基础数据
export const GAME_BASE_DATA = {
    chesser_outter_count: 52,                       // 外环棋点数量
    chesser_inner_count: 24,                        // 内环棋点数量
    chesser_inner_singer_count: 6,                  // 内环单方棋点数量
    player_max_count: 4,                            // 最大玩家数量
    player_min_count: 2,                            // 最小玩家数量
    player_chesser_count: 4,                // 玩家棋子数量
    active_plane_num: [[2, 4, 6], [5, 6], [6]],     // 起飞号码
}

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
    THE_RED,
    THE_YELLOW,
    THE_BLUE,
    THE_GREEN
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
    set_skin: 'fc_plane_set_skin',                  // 设置皮肤
    set_pos: 'fc_plane_set_pos',                    // 设置位置
    set_rotation: 'fc_plane_set_rotation',          // 设置方向
    move_to: 'fc_plane_move_to',                    // 移动到(带方向)
    play_anim: 'fc_plane_play_anim',                // 播放飞机动画
    allow_touch: 'fc_plane_allow_touch',            // 允许点击 
    feedback_move_end: 'fc_plane_feedback_move_end',          // 反馈移动结束
    feedback_be_touch: 'fc_plane_feedback_be_touch',          // 反馈被点击
};

/**
 * 事件
 */
export const FC_EVENT = {
    PLAYER_DICE_NUM: 'fc_player_dice_num',                  // 玩家骰子数          
}