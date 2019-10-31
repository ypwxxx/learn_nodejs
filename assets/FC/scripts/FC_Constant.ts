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
}