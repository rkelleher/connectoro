import React from 'react';
import MaterialTable from 'material-table';
import _ from '@lodash';
import { useSelector } from 'react-redux';

const columns = [
    { title: 'Country Name', field: 'official_name_en' },
    { title: 'Alpha2', field: 'alpha_2' },
    { title: 'Numeric', field: 'ISO3166-1-numeric' },
    { title: 'Default Easync Retailer', field: 'default_easync_retailer' },
    { title: 'Default Shipping Method', field: 'default_easync_shipping', 
        lookup: { 
            free: 'free', 
            cheapest: 'cheapest',
            fastest: 'fastest',
            free_standard: 'free_standard',
            no_rush: 'no_rush',
            expedited: 'expedited'
        }
    }
];

function CountriesTable() {
    const account = useSelector(({ account }) => account);

    columns[3].lookup = _
        .chain(account.retailerCodes)
        .keyBy('retailerCode')
        .mapValues('retailerCode')
        .value();
    
    return (
        <MaterialTable
            title="Countries"
            columns={columns}
            data={account.countries}
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
                onRowUpdate: newData =>
                    new Promise((resolve, reject) => {
                        setTimeout(() => {
                            resolve();
                        }, 1000)
                    }),
                onRowDelete: newData =>
                    new Promise((resolve, reject) => {
                        setTimeout(() => {
                            resolve();
                        }, 1000)
                    })
            }}
        />
    );
}

export default CountriesTable;
