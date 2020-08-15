import _ from "lodash";
const get = _.get;

import { LINNW_INTEGRATION_TYPE } from "../integrations/linnworks.js";
import { EASYNC_INTEGRATION_TYPE, buildEasyncOrderData } from "../integrations/easync/easync.js";

export function getIntegrationByType(account, integrationType) {
  return account.integrations.find(el =>
    el.integrationType === integrationType
  );
}

export function convertLinnworksOrder(linnwOrder) {
  const {
    NumOrderId,
    GeneralInfo,
    CustomerInfo: { Address }
  } = linnwOrder;

  const shippingAddress = {
      firstName: Address.FullName,
      lastName: Address.Company
        ? `${Address.FullName} - ${Address.Company}`
        : '',
      addressLine1: Address.Address1,
      addressLine2: Address.Address2,
      addressLine3: Address.Address2 && Address.Address2
        ? `${Address.Address2}, ${Address.Address3}`
        : Address.Address3,
      zipCode: Address.PostCode,
      city: Address.Town,
      state: Address.Region,
      countryName: Address.Country,
      phoneNumber: Address.PhoneNumber || Math.random().toString().slice(2,11)
  };

  const integrationData = {
    [LINNW_INTEGRATION_TYPE]: {
      numOrderId: NumOrderId,
      status: GeneralInfo.Status
    },
    [EASYNC_INTEGRATION_TYPE]: buildEasyncOrderData({ shippingAddress })
  };

  return {
    shippingAddress,
    integrationData
  };
}

export function convertLinnworksProduct(product, account) {
  return ({
    SKU: product.SKU,
    title: product.Title,
    description: product.ChannelTitle,
    integrationData: {
      [EASYNC_INTEGRATION_TYPE]: {
        orderProductData: get(account, [
          "integrationData",
          EASYNC_INTEGRATION_TYPE,
          "orderProductData"
        ])
      }
    }
  })
}
