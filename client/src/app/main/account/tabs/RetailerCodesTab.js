import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Actions from "app/store/actions";
import { FuseLoading } from "@fuse";

function RetailerCodesTab() {
    const dispatch = useDispatch();

    const account = useSelector(({ account }) => account);

    useEffect(() => {
        dispatch(Actions.getAccountRetailerCodes());
    }, [dispatch]);

    return account.isFetching ? (
        <FuseLoading />
    ) : (
        <h1>
            Retailers
        </h1>
    );
}
    
export default RetailerCodesTab;
