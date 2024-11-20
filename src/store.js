// store.js

import { createStore, combineReducers } from 'redux';
import invoiceReducer from './reducers/invoiceReducer';

const rootReducer = combineReducers({
  invoice: invoiceReducer,
});

const store = createStore(rootReducer);

export default store;
