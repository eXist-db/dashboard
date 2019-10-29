import { createStore } from '../../assets/redux/dist/redux.js';
import { reducer } from './reducer.js';

export const store = createStore(
    reducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);