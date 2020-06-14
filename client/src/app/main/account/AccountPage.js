import React, { useState } from "react";
import {
    Tabs,
    Tab
} from "@material-ui/core";
import { FusePageCarded } from "@fuse";
import GeneralSettingsTab from "./tabs/GeneralSettingsTab";
import "./AccountPage.css";

function AccountPage() {
    const [selectedTab, setSelectedTab] = useState(0);

    const handleTabChange = (event, value) => {
        setSelectedTab(value);
    };

    return (
        <FusePageCarded
            classes={{
                toolbar: "p-0"
            }}
            header={
                <div className="py-24">
                    <h1>Account Settings</h1>
                </div>
            }
            contentToolbar={
                <Tabs
                    value={selectedTab}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="scrollable"
                    scrollButtons="off"
                    className="w-full h-64"
                >
                    <Tab className="h-64" label="General Settings" />
                </Tabs>
            }
            content={
                <>
                    {selectedTab === 0 && 
                        <div className="p-24">
                            <GeneralSettingsTab />
                        </div>
                    }
                </>
            }
        />
    );
}

export default AccountPage;
