import {state} from './state';
import {mutation} from './mutation';
import {action} from './action';
import {getter} from './getter';
import {Store} from './core/store';

export default new Store({
    state,
    mutation,
    getter,
    action
})