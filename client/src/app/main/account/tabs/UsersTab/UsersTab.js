import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Button,
    Icon
} from "@material-ui/core";
import * as Actions from "app/store/actions";
import { FuseLoading } from "@fuse";
import UsersTable from "./UsersTable";

function UsersTab() {
    const dispatch = useDispatch();

    const account = useSelector(({ account }) => account);

    useEffect(() => {
        dispatch(Actions.getAccountUsers());
    }, [dispatch]);

    return account.isFetching ? (
        <FuseLoading />
    ) : (<>
        <div className="flex flex-1 w-full items-center justify-end p-5">
            <Button
                variant="contained"
            >
                <Icon className="mr-4">add</Icon>
                Add User
            </Button>
        </div>

        <UsersTable />
    </>);
}
    
export default UsersTab;
