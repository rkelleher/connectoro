import {combineReducers} from 'redux';
import fuse from './fuse';
import auth from 'app/auth/store/reducers';
import account from 'app/store/reducers/account.reducer';
import order from 'app/store/reducers/order.reducer';
import orders from 'app/store/reducers/orders.reducer';
import product from 'app/store/reducers/product.reducer';
import products from 'app/store/reducers/products.reducer';
import quickPanel from 'app/fuse-layouts/shared-components/quickPanel/store/reducers';

const createReducer = (asyncReducers) =>
    combineReducers({
        product,
        products,
        order,
        orders,
        account,
        auth,
        fuse,
        quickPanel,
        ...asyncReducers
    });

export default createReducer;
