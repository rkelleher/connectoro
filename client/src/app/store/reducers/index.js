import {combineReducers} from 'redux';
import fuse from './fuse';
import auth from 'app/auth/store/reducers';
import account from './account.reducer';
import quickPanel from 'app/fuse-layouts/shared-components/quickPanel/store/reducers';

const createReducer = (asyncReducers) =>
    combineReducers({
        account,
        auth,
        fuse,
        quickPanel,
        ...asyncReducers
    });

export default createReducer;
