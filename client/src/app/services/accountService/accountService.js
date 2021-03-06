import FuseUtils from "@fuse/FuseUtils";
import axios from "axios";

class AccountService extends FuseUtils.EventEmitter {
    fetchAccountDetails = async () => {
        const { data } = await axios.get("/api/account");
        return data;
    };

    fetchAccountLinnworksData = async () => {
        const { data } = await axios.get("/api/account/refresh-locations");
        return data;
    };

    sendLinnworksLocationData = async id => {
        return await axios.put("/api/account/change-location", {
            StockLocationId: id
        });
    };

    sendNewIntegration = async type => {
        const { data } = await axios.post("/api/account/integrations", {
            type
        });
        return data;
    };

    deleteIntegration = async id => {
        const { data } = await axios({
            method: "delete",
            url: "/api/account/integrations",
            data: { id }
        });
        return data;
    };

    addCredential = async (id, type, content) => {
        const { data } = await axios.patch("/api/account/integrations", {
            id,
            changes: {
                credentials: {
                    [type]: content
                }
            }
        });
        return data;
    };

    deleteCredential = async (id, type) => {
        const { data } = await axios.patch("/api/account/integrations", {
            id,
            changes: {
                credentials: {
                    [type]: null
                }
            }
        });
        return data;
    };

    setIntegrationOptions = async (id, options) => {
        const { data } = await axios.patch("/api/account/integrations", {
            id,
            changes: {
                options
            }
        });
        return data;
    };

    updateAccount = async changes => {
        const { data } = await axios.patch("/api/account", {
            changes
        });
        return data;
    }

    fetchAccountUsers = async () => {
        const { data } = await axios.get("/api/account/users");
        return data;
    }

    fetchAccountRetailerCodes = async () => {
        const { data } = await axios.get("/api/account/retailer-codes");
        return data;
    }

    deleteAccountRetailerCode = async id => {
        const { data } = await axios({
            method: "delete",
            url: `/api/account/retailer-codes/${id}`
        });
        return data;
    };

    updateAccountRetailerCode = async payload => {
        const { data } = await axios({
            method: "put",
            url: `/api/account/retailer-codes/${payload.retailerCode}`,
            data: payload
        });
        return data;
    };

    fetchAccountCountries = async () => {
        const { data } = await axios.get("/api/account/countries");
        return data;
    }
}

const instance = new AccountService();

export default instance;
