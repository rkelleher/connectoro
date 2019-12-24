import { Account } from "../models/account.model.js";

export async function getAccount(accountId) {
  return Account.findById(accountId);
}

export async function createNewLinkedAccount(user) {
  const account = new Account({
    email: user.email,
    users: [user._id]
  });
  user.account = account._id;
  await account.save();
  await user.save();
  return account;
}

export async function addIntegration(account, integrationType, opts = {}) {
  if (opts.appId) {
    account.integrations.push({
      integrationType,
      appId: opts.appId
    });
  } else {
    account.integrations.push({
      integrationType
    });
  }
  await account.save();
  return account;
}

export async function getIntegrationByType(account, integrationType) {
  return account.integrations.find(x => x.integrationType === integrationType);
}

export function getIntegrationCredential(integration, key) {
  const credential =
    integration.credentials && integration.credentials.get(key);
  return credential;
}

export async function deleteIntegration(account, integrationId) {
  account.integrations.pull({
    _id: integrationId
  });
  await account.save();
  return account;
}

export async function updateIntegration(account, integrationId, changes) {
  const integration = account.integrations.id(integrationId);

  if (changes.credentials) {
    for (const k of Object.keys(changes.credentials)) {
      const v = changes.credentials[k];
      if (v === null) {
        integration.credentials.delete(k);
      } else {
        if (!integration.credentials) {
          integration.credentials = new Map();
        }
        integration.credentials.set(k, v);
      }
    }
  }

  await account.save();
  return account.integrations.id(integrationId);
}
