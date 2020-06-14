import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Actions from "app/store/actions";
import { TextField } from "@material-ui/core";
import { FuseLoading } from "@fuse";

function GeneralSettingsTab() {
    const dispatch = useDispatch();

    const account = useSelector(({ account }) => account);

    useEffect(() => {
        dispatch(Actions.getAccountDetails());
    }, [dispatch]);

    return account.isFetching ? (
            <FuseLoading />
        ) : (
        <div style={{margin: 10}}>
            <TextField
                disabled
                id="outlined-disabled"
                label="Account Email"
                defaultValue={account.email}
                margin="normal"
                variant="outlined"
            />
        </div>
    );
}
    
export default GeneralSettingsTab;
