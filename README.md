# wxStore-微信小程序全局状态管理
## 功能
实现了类似vuex的功能：
- [x] State
- [x] Mutation
- [x] Action
- [x] Getter
- [ ] Module

## 初始化
在小程序app.js onLuanch前new Store，可参考utils/store/index

在需要全局状态的page，在onload的时候调用wx.$store.setWatcher(this)，组件暂未实现

可在wxml中直接使用state中的key {{state.test}}

## 调用
- 调用action: wx.$store.fetch()
- 调用mutation: wx.$store.commit()
- 调用getter: wx.$getter.x;