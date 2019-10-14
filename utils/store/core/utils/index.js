export function def(obj, key, value) {
    Reflect.defineProperty(obj, key, {
        value,
        enumerable: false,
        writable: true,
        configurable: true
    })
}

export function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key)
}

const _toString = Object.prototype.toString;
export function isPlainObject(value) {
    // console.log(_toString.call(value), value)
    return _toString.call(value) === '[object Object]'
}