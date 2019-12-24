import React from "react";
import { useSelector } from "react-redux";
import * as Actions from "app/store/actions";
import EasyncOrderOptions from "./EasyncOrderOptions";
import EasyncProductOptions from "./EasyncProductOptions";

export default ({ data }) => {
    const { orderData, orderProductData } = data;

    const orderOptionsIsSaving = useSelector(
        ({ account }) => account.isSavingEasyncOrderOptions
    );
    const productOptionsIsSaving = useSelector(
        ({ account }) => account.isSavingEasyncProductOptions
    );

    return (
        <div>
            <h2>Easync Options</h2>
            <div>
                <h3>Default Order Options</h3>
                <div>
                    <EasyncOrderOptions
                        data={orderData}
                        saveAction={Actions.saveAccountEasyncOrderOptions}
                        isSaving={orderOptionsIsSaving}
                    />
                </div>
                <h3>Default Product Options</h3>
                <div>
                    <EasyncProductOptions
                        data={orderProductData}
                        isSaving={productOptionsIsSaving}
                        saveAction={
                                Actions.saveAccountEasyncProductSelectionCriteriaOptions
                        }
                    />
                </div>
            </div>
        </div>
    );
};
