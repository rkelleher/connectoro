import _ from "lodash";
import React from "react";
import { Options } from "app/components/Options";
import { easyncPath } from "./easync";

// TODO get from server
const shippingMethodOptions = [
    "free",
    "fastest",
    "cheapest",
    "free_standard",
    "no_rush",
    "expedited"
];

export default props => (
    <Options
        id={props.optionSource ? props.optionSource._id : ""}
        data={_.pick(
            props.dataOverride
                ? props.dataOverride
                : _.get(props.optionSource, easyncPath),
            props.optionKeys || []
        )}
        stringOptions={{ shippingMethod: shippingMethodOptions }}
        {...props}
    />
);
