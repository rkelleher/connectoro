import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Actions from "app/store/actions";
import { FuseLoading } from "@fuse";

function IntegrationPage() {
    const dispatch = useDispatch();

    const isFetching = useSelector(({ account }) => account.isFetching);

    useEffect(() => {
        dispatch(Actions.getAccountDetails());
    }, [dispatch]);

    return isFetching ? (
        <FuseLoading />
    ) : (
        <h1>Integrations</h1>
    );
}

export default IntegrationPage;
