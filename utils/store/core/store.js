// 将数据的每一项转为proxy
import {observe} from './observer';
import {actionHandler} from './action';
import {mutationHandler} from './mutation'
wx.DEBUG = true;
// 更新页面state
function updateState(obj) {
  this.setData(obj);
}



// 合并方法
function MerFunc(options, type, stat_func) {
  let o_func = options[type];
  if (typeof o_func === 'function') {
    options[type] = function() {
      stat_func.apply(this, arguments);
      o_func.apply(this, arguments);

    }
  } else {
    options[type] = stat_func;
  }
}

function onShowFunc() {
  // 激活实例
  if (this._isActive === false) {
    // 需要更新state
    updateState.call(this, wx.$store.pureState)
  }
  this._isActive = true;
}

function onHideFunc() {
  this._isActive = false;
}

function onDestroyFunc() {
  // 销毁实例时要将订阅的对象删除
  this._isActive = false;
  wx.$store.removeWatcher(this);
}

// 原状态state
let state = {}
// proxy后的state
let _state = null;
class Store {

  constructor(options) {
    wx.$store = this;
    this.handleState(options.state);
    this.handleMutation(options.mutation);
    this.handleAction(options.action);
    // 订阅者
    this.subs = []
  }

  // 初始化action
  handleAction(action) {
    if (action) {
      actionHandler(action, _state, this);
    }
  }

  // 初始化mutation
  handleMutation(mutation) {
    if (mutation) {
      // mutation.forEach()
      mutationHandler(mutation, _state, this);
    }
  }

  // 处理state，将state转为proxy
  handleState(data) {
    // observe
    state = data;
    _state = observe(data, true)
  }

  get state() {
    // return JSON.parse(JSON.stringify(state))
    return _state
  }

  get pureState() {
    // 只读，修改了这里的内容不会对内存的内容产生影响
    return JSON.parse(JSON.stringify(_state))
  }

  // 设置订阅者
  setWatcher(instance, module = null) {
    // TODO module
    // 修改实例的部分生命周期函数
    instance._isActive = true;
    MerFunc(instance, 'onShow', onShowFunc)
    MerFunc(instance, 'onHide', onHideFunc)
    MerFunc(instance, 'onUnload', onDestroyFunc)
    // 将state数据注入
    this.subs.push(instance);
    updateState.call(instance, wx.$store.pureState)
  }

  // 移除订阅者
  removeWatcher(instance) {
    this.subs = this.subs.filter(e => e != instance);
  }
}

export {
  Store
}

