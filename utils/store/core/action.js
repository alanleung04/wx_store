import {commit} from './mutation'
import {isPlainObject} from './utils/index'
let actionMap = new WeakMap();
let ori_action = {}
export function actionHandler(action, state, store) {
    ori_action = action;
    let keys = Object.keys(action);
    console.log('[action keys]:', keys);
    for (let i = 0; i < keys.length; i ++) {
        if (typeof action[keys[i]] === 'function') {
            // register
            let ori_func = action[keys[i]];
            actionMap.set(ori_func, buildFetchFunc(state, ori_func))
        }
    }

    store.fetch = fetch;

}

function buildFetchFunc(state, ori_func) {
    return function(...args) {
        args.unshift({commit, state});
        // action需要返回函数的结果（可能是异步函数）
        return ori_func.apply(null, args);
    }
}

export function fetch(...args) {
    if (wx.DEBUG) {
        console.info('[fetch]', args)
    }
    let type = '';
    if (isPlainObject(args[0])) {
        // 对象类型分发;
        type = args[0].type;
        delete args[0].type;
        args = [args[0]];

    } else {
        // 以荷载的形式分发
        if (args.length <= 0 || typeof args[0] !== 'string') {
            if (wx.DEBUG) {
                console.warn('[mutation]:请输入参数')
            }
            return;
        }
        type = args.shift();
    }

    if (typeof ori_action[type] === 'function') {
        let fetchFun = actionMap.get(ori_action[type]);
        fetchFun.apply(null, args);
    } else {
        // 未定义type
        if (wx.DEBUG) {
            console.warn(`[mutation]:未定义key为${key}的mutation`)
        }
    }
}