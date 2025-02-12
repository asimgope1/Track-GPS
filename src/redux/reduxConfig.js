import {configureStore,applyMiddleware,compose} from '@reduxjs/toolkit';
import thunk from 'redux-thunk';
import rootReducer from './reducers/index';

const middleware = [
    thunk
]

export default configure = (initialState = {}) => {
    return configureStore(
        rootReducer,
        initialState,
        compose(applyMiddleware(...middleware)))
}
