import {lock, unlock} from './lock'
import {isPlainObject} from './utils/index';
let mutationMap = new WeakMap();
let ori_mutation = {}
export function mutationHandler(mutation, state, store) {
    // 将mutation的方法封装在commit
    ori_mutation = mutation;
    let keys = Object.keys(mutation);
    if (wx.DEBUG) {
        console.log('[mutation]keys', keys)
    }
    // this.mutation = {}
    for (let i = 0; i < keys.length; i++) {
        // 将mutation的function转为commit
        let o_func = mutation[keys[i]];
        if (typeof o_func === 'function') {
            mutationMap.set(o_func, buildCommitFunc(o_func, state))
        }
    }

    // mixin commit
    store.commit = commit;
}

function buildCommitFunc(o_func, state) {
    return function(...args) {
        
        // 第一个参数是state，这里可以加入任意的其他操作
        args.unshift(state);
        // console.log('here func', args);
        o_func.apply(null, args);

        // mutation是对state的操作，无返回值
        // return result;
    }
}

export function commit(...args) {
    if (wx.DEBUG) {
        console.info('[commit]', args)
    }
    // console.log('commit', args);
    let key = ''
    if (isPlainObject(args[0])) {
        // 以对象形式提交
        key = args[0].type;
        delete args[0].type;
        // 只接受object参数
        args = [args[0]]
    } else {
        // 以载荷形式提交
        if (args.length <= 0 || typeof args[0] !== 'string') {
            if (wx.DEBUG) {
                console.warn('[mutation]:请输入参数')
            }
            return;
        }
        key = args.shift();
    }
    
    if (typeof ori_mutation[key] === 'function') {
        let commitFunc = mutationMap.get(ori_mutation[key])
        // 执行操作
        //  解锁
        unlock()
        commitFunc.apply(null, args)
        // 上锁
        lock()
    } else {
        // 未定义key
        if (wx.DEBUG) {
            console.warn(`[mutation]:未定义key为${key}的mutation`)
        }

    }
    
}