import React from "react";
import { TextField, FormControlLabel, Switch } from "@material-ui/core";
import { FuseChipSelect } from "@fuse";

export function Option({
    isInline,
    optionKey,
    label,
    choices,
    form,
    handleChange,
    setInForm
}) {
    if (choices === "str") {
        return (
            <TextField
                style={{
                    maxWidth: isInline ? 100 : 300
                }}
                label={label}
                id={optionKey}
                name={optionKey}
                value={form[optionKey]}
                onChange={handleChange}
                variant="outlined"
                fullWidth
            />
        );
    } else if (choices === "bool") {
        return (
            <FormControlLabel
                label={label}
                control={
                    <Switch
                        name={optionKey}
                        checked={form[optionKey]}
                        onChange={handleChange}
                    />
                }
            />
        );
    } else if (choices === "int") {
        return (
            <TextField
                style={{
                    maxWidth: isInline ? 100 : 300
                }}
                id={optionKey}
                name={optionKey}
                label={label}
                type="number"
                value={form[optionKey]}
                onChange={handleChange}
                InputLabelProps={{
                    shrink: true
                }}
            />
        );
    } else if (choices.map) {
        return (
            <div style={{ minWidth: 150 }}>
                <FuseChipSelect
                    // className="w-full my-16"
                    value={
                        form[optionKey] &&
                        form[optionKey].map(x => ({ value: x, label: x }))
                    }
                    onChange={chosen =>
                        setInForm(
                            optionKey,
                            chosen.map(({ value }) => value)
                        )
                    }
                    placeholder={`Select ${label}`}
                    textFieldProps={{
                        label,
                        InputLabelProps: {
                            shrink: true
                        },
                        variant: "standard"
                    }}
                    options={choices.map(choice => ({
                        value: choice,
                        label: choice
                    }))}
                    isMulti
                />
            </div>
        );
    }
    return (
        <p>
            <b>Not implemented: </b>
            {label}
        </p>
    );
}
