import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
    closeDialog,
} from "app/store/actions";

import {
    Button,
    DialogTitle,
    DialogContent,
    DialogActions,
    RadioGroup,
    FormControlLabel,
    Radio
} from "@material-ui/core";

export default function ConfirmationDialog({
    submit,
    options,
    title,
    submitText
}) {
    const dispatch = useDispatch();
    const [chosenOption, setChosenOption] = useState(options[0].key);
    const handleChange = event => {
        setChosenOption(event.target.value);
    };
    return (
        <>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent dividers>
                <RadioGroup
                    name="integrationType"
                    value={chosenOption}
                    onChange={handleChange}
                >
                    {options.map(option => (
                        <FormControlLabel
                            value={option.key}
                            key={option.key}
                            control={<Radio />}
                            label={option.label}
                        />
                    ))}
                </RadioGroup>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => dispatch(closeDialog())} color="primary">
                    Cancel
                </Button>
                <Button onClick={() => submit(chosenOption)} color="secondary">
                    {submitText}
                </Button>
            </DialogActions>
        </>
    );
}
