import React from "react";
import { useSelector } from "react-redux";
import * as Actions from "app/store/actions";
import EasyncProductOptions from "./EasyncProductOptions";
import EasyncOrderOptions from "./EasyncOrderOptions";
import { Typography, Divider } from "@material-ui/core";

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
            <div>
                <Typography variant="h6" component="h6" style={{ marginTop: 20 }}>
                    Easync Order Settings
                </Typography>

                <div>
                    <EasyncOrderOptions
                        // TODO clean up this override business
                        dataOverride={orderData}
                        optionKeys={[
                            "shippingMethod",
                            "isGift",
                            "isFBE",
                            "maxOrderPrice"
                        ]}
                        saveAction={Actions.saveAccountEasyncOrderOptions}
                        isSaving={orderOptionsIsSaving}
                        isInline
                        smCol={2}
                    />
                </div>

                <Divider className="HorizontalLine"/>
                <Typography variant="h6" component="h6" style={{ marginTop: 20 }}>
                    Default Product Options
                </Typography>

                <div>
                    <EasyncProductOptions
                        data={orderProductData}
                        isSaving={productOptionsIsSaving}
                        isInline
                        saveAction={
                                Actions.saveAccountEasyncProductSelectionCriteriaOptions
                        }
                        smCol={2}
                    />
                </div>
            </div>
        </div>
    );
};
