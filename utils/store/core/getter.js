export function getterHandler(getter, store) {
    store.getter = {};
    let keys = Object.keys(getter);
    for (let i = 0; i < keys.length; i++) {
        let ori_func = getter[keys[i]];
        if (typeof ori_func === 'function') {
            // store.getter[keys[i]] = function() {
            //     return ori_func(store.pureState, store.getter);
            // }
            Object.defineProperty(store.getter, keys[i], {
                get: function() {
                    return ori_func(store.pureState, store.getter);
                }
            })
        }
    }
}
