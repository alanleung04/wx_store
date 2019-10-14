export const mutation = {
    setTestInfo(state, testInfo) {
        console.log('in here', state);
        state.test = testInfo;
    },
    addKey(state, item) {
        state.key.push(item);
    }

}