// 处理数组情况的数据
import {def} from './utils/index'
import {observe} from './observer'
import {LOCKED} from './lock'
const arrayProto = Array.prototype;
// // 直接继承
const arrayMethods = Object.create(arrayProto);

// // 需要更新的方法
const methodsToPatch = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
]



methodsToPatch.forEach((method) => {
    const origin = arrayProto[method];
    def(arrayMethods, method,function mutator (...args) {
        // 结果
        if (LOCKED) {
            if (wx.DEBUG) {
                console.warn('[store]:请通过commit更新state')
            }
            return
        }
        let ob = this.__ob__;
        let old_value = JSON.stringify(rawToReactive.get(this));
        const result = origin.apply(rawToReactive.get(this), args);
        let new_value = JSON.stringify(rawToReactive.get(this));
        // 绕过Array本身数组操作的get和set
        // this = result;
        console.log(this);
        // this = rawToReactive.get(this);
        // console.log('result', result);
        // update()
        if (old_value !== new_value) {
            updateByFun(this);
            ob && ob.observeArray(rawToReactive.get(this), this.root_key);
        }
        
        return result;
    })
})

function updateByFun(target) {
    // console.log('[数组数据更新]：', target)
    wx.$store.subs.forEach((instance) => {
        if (!instance._isActive) {
            return;
          }
        let key = target.root_key;
        instance.setData({
            [key]: JSON.parse(JSON.stringify(target))
        })    
    })
}

// 

const rawToReactive = new WeakMap();
export function proxyArray(arr, root) {
    let ob = arr.__ob__;
    arr.__proto__ = arrayMethods;
    let handler = {
        set: (target, prop, value, receiver) => {
            if (LOCKED) {
                if (wx.DEBUG) {
                    console.warn('[store]:请通过commit更新state')
                }
                return
            }
            if (wx.DEBUG) {
                console.log('[数组操作]：', target, prop, value, receiver)
            }
            if (JSON.stringify(target[prop]) !== JSON.stringify(value)) {
                // 
                
                target[prop] = observe(value, `${target.root_key}[${prop}]`);
                // target[prop] = value;
                // 更新
                wx.$store.subs.forEach((instance) => {
                    updateItem.call(instance, target, value, prop);
                })
            }
            
            return true;
        }
    }

    let proxy = new Proxy(arr, handler);
    rawToReactive.set(proxy, arr);
    ob && ob.observeArray(arr, root);
    return proxy;
}

//  数组的更新函数
function updateItem(target, value, prop) {
    if (!this._isActive) {
        // console.log('实例不在页面上')
        return;
      }
    let key = target.root_key + `[${prop}]`;
    // console.log("[数组单条数据更新]", target, this);
    this.setData({
        [key]: JSON.parse(JSON.stringify(value))
    })
}