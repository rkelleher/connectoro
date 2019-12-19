import {combineReducers} from 'redux';
import fuse from './fuse';
import auth from 'app/auth/store/reducers';
import account from 'app/store/reducers/account.reducer';
import orders from 'app/store/reducers/orders.reducer';
import quickPanel from 'app/fuse-layouts/shared-components/quickPanel/store/reducers';

const createReducer = (asyncReducers) =>
    combineReducers({
        orders,
        account,
        auth,
        fuse,
        quickPanel,
        ...asyncReducers
    });

export default createReducer;
