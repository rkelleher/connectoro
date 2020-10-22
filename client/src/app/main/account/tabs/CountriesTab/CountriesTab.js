import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Actions from "app/store/actions";
import { FuseLoading } from "@fuse";
import CountriesTable from "./CountriesTable";

function CountriesTab() {
    const dispatch = useDispatch();

    const account = useSelector(({ account }) => account);

    useEffect(() => {
        dispatch(Actions.getAccountCountries());
        dispatch(Actions.getAccountRetailerCodes());
    }, [dispatch]);


    return account.isFetching ? (
        <FuseLoading />
    ) : (
        <CountriesTable />
    );
}
    
export default CountriesTab;
