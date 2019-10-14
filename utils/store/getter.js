export const getter = {
    getFirstKey(state) {
        return state.key[0]
    },

    getIndexKey: (state) => (index) => {
        return state.key[index];
    },

    getLast3Key(state) {
        return state.key.filter((v, i) => i > 0)
    }
}