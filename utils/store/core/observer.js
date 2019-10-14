import {
    def,
    hasOwn,
    isPlainObject
} from './utils/index'
import {
    LOCKED
} from './lock'
import {
    proxyArray
} from './array'


function defineReactive(obj, root) {
    if (!isPlainObject(obj)) {
      return;
    }
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
        let key = root;
        if (root === true) {
            // 最外层的key，用于setData
            key = keys[i];
        } else if (typeof root === 'string') {
            key = `${root}.${keys[i]}`
        }
        obj[keys[i]] = observe(obj[keys[i]], key)
    }
    let handler = {
      get: function(target, key) {
        // 
        return Reflect.get(target, key);
      },
      set: function(target, key, value) {
          if (LOCKED) {
              console.warn('[store]:请通过commit更新state')
              return
          }
        if (JSON.stringify(value) !== JSON.stringify(target[key])) {
            // console.log('setter 更新')
          // 更新
          value = observe(value, `${target.root_key ? target.root_key + '.' : ''}${key}`);
          Reflect.set(target, key, value);
          // 通知订阅者
          wx.$store.subs.forEach((instance) => {
            update.call(instance, target, value, key);
          })

        } else {
            return false
        }
        return true;
      }
    }
  
    let proxy = new Proxy(obj, handler)
  
    return proxy;
}

// 更新具体某条数据
export function update(target, value, key) {
    
    if (!this._isActive) {
    //   console.log('实例不在页面上')
      return;
    }
    let update_key = (target.root_key ? target.root_key + '.' : '') + `${key}`
    if (wx.DEBUG) {
        console.log('[更新]', target, value, key, update_key)
    }
    // 确保给页面的数据是纯净的
    let data = {
        [update_key]: JSON.parse(JSON.stringify(value))
    }

    this.setData(data);
  }
  
  

export class Observer {
    constructor(value, root = false) {
        this.value = value;
        def(value, '__ob__', this);
        if (typeof root === 'string') {
            def(value, 'root_key', root);
        }
        if (Array.isArray(value)) {
            this.p_value = proxyArray(value, root);
        } else {
            this.p_value = defineReactive(value, root);
        }
        
    }

    observeArray(arr, root) {
        for (let i = 0; i < arr.length; i++) {
            arr[i] = observe(arr[i], `${root}[${i}]`);
        }
    }


}

// 执行观察函数
export function observe(value, root = false) {
    
    if (!isPlainObject(value) && !Array.isArray(value)) return value;
    if (wx.DEBUG) {
        console.log('ob', value);
    }
    let ob;
    if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
        ob = value.__ob__;
    } else {
        ob = new Observer(value, root).p_value;
    }

    return ob;
}