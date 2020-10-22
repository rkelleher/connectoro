import React from 'react';
import MaterialTable from 'material-table';
import { useSelector, useDispatch } from 'react-redux';
import * as Actions from "app/store/actions";

const columns = [
    { title: 'Retailer Name', field: 'retailerName' },
    { title: 'Retailer Code', field: 'retailerCode' },
    { title: 'Retailer Icon', field: 'retailerIcon' },
    { title: 'Retailer Flag', field: 'retailerFlag' }
];

function RetailerCodesTable() {
    const dispatch = useDispatch();

    const codes = useSelector(({ account }) => account.retailerCodes);

    return (
        <MaterialTable
            title="Retailer Codes"
            columns={columns}
            data={codes}
            options={{
                selection: true,
                actionsColumnIndex: -1
            }}
            editable={{
                onRowAdd: newData =>
                    new Promise((resolve, reject) => {
                        setTimeout(() => {
                            resolve();
                        }, 1000)
                    }),
                onRowUpdate: (newData, oldData) => dispatch(
                    Actions.updateAccountRetailerCode(newData)
                ),
                onRowDelete: ({ retailerCode })=> dispatch(
                    Actions.deleteAccountRetailerCode(retailerCode)
                )
            }}
        />
    );
}

export default RetailerCodesTable;
