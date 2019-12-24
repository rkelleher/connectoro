import React from "react";
import { Options } from "app/main/account/Options";
import * as Actions from "app/store/actions";

function getSelectionCriteriaArrayChoices(key) {
    if (key === "conditionIn") {
        return ["New"];
    } else {
        return [];
    }
}

export default ({ data, isSaving, saveAction, saveActionParam }) => {
    const selectionCriteria = data.selectionCriteria;
    return (
        <div>
            {selectionCriteria && (
                <>
                    <h4>Selection Criteria</h4>
                    <div>
                        <Options
                            data={selectionCriteria}
                            saveAction={saveAction}
                            saveActionParam={saveActionParam}
                            isSaving={isSaving}
                            getArrayChoices={getSelectionCriteriaArrayChoices}
                        />
                    </div>
                </>
            )}
        </div>
    );
};
