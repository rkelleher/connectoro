import { Account } from '../models/account.model.js';

export async function getAccount(id) {
  return Account.findById(id);
}

export async function createNewLinkedAccount(creator) {
  const account = new Account({
    email: creator.email,
    users: [creator._id]
  });
  creator.account = account._id;
  await account.save();
  await creator.save();
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
  return account.integrations.find(x => x.integrationType === integrationType)
}

export function getIntegrationCredential(integration, key) {
  const credential = integration.credentials && integration.credentials.get(key);
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

  if (changes.options) {
    for (const k of Object.keys(changes.options)) {
      const v = changes.options[k];
      if (!integration.options) {
        integration.options = new Map();
      }
      integration.options.set(k, v);
    }
  }

  await account.save();
  return account.integrations.id(integrationId);
}

export function buildAccountDetails(account) {
  return {
    email: account.email,
    integrations: account.integrations,
    users: account.users
  }
}
