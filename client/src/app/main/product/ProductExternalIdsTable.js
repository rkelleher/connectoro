import _ from "lodash";
import React from "react";
import * as Actions from "app/store/actions";
import { useDispatch } from "react-redux";
import MaterialTable from "material-table";
import axios from "axios";

// TODO convert to proper redux actions/reducer etc.
export const ProductIdentifierTable = ({ product }) => {
    const dispatch = useDispatch();

    const tableColumns = [
        {
            title: "Type",
            field: "idType",
            // TODO get from server
            lookup: {
                "SKU": "SKU",
                "amazon": "Amazon US ASIN",
                "amazon_uk": "Amazon UK ASIN",
                "amazon_de": "Amazon DE ASIN",
                "amazon_fr": "Amazon FR ASIN",
                "amazon_it": "Amazon IT ASIN",
                "amazon_es": "Amazon ES ASIN",
                "amazon_ca": "Amazon CA ASIN"
            }
        },
        {
            title: "Identifier",
            field: "identifier"
        }
    ];

    const tableData = _.map(
        _.filter(
            Object.keys(product.externalIds),
            idType => !!product.externalIds[idType]
        ),
        idType => ({
            idType,
            identifier: _.get(product, ["externalIds", idType])
        })
    );

    const onRowAdd = async ({ idType, identifier }) => {
        const { data } = await axios.patch(`/api/products/${product._id}`, {
            "changes": {
                "externalIds": {
                    [idType]: identifier
                }
            }
        });
        if (data) {
            dispatch({
                type: Actions.SET_PRODUCT,
                payload: data
            });
        }
    };

    const onRowUpdate = async ({ idType, identifier }) => {
        const { data } = await axios.patch(`/api/products/${product._id}`, {
            "changes": {
                "externalIds": {
                    [idType]: identifier
                }
            }
        });
        if (data) {
            dispatch({
                type: Actions.SET_PRODUCT,
                payload: data
            });
        }
    };

    const onRowDelete = async ({ idType }) => {
        const { data } = await axios.patch(`/api/products/${product._id}`, {
            "changes": {
                "externalIds": {
                    [idType]: null
                }
            }
        });
        if (data) {
            dispatch({
                type: Actions.SET_PRODUCT,
                payload: data
            });
        }
    };

    return (
        product && (
            <div className="pb-48" style={{maxWidth: 600}}>
                <MaterialTable
                    title="Identifiers"
                    columns={tableColumns}
                    data={tableData}
                    editable={{ onRowAdd, onRowUpdate, onRowDelete }}
                    options={{
                        actionsColumnIndex: 2,
                        search: false,
                        paging: false
                    }}
                />
            </div>
        )
    );
};
