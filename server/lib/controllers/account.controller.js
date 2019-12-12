import { Account } from '../models/account.model.js';

export async function createNewLinkedAccount(creator) {
  const account =  new Account({
    email: creator.email,
    users: [creator._id]
  });
  creator.account = account._id;
  await account.save();
  await creator.save();
  return account;
}

export async function addIntegration(account, integrationType) {
  account.integrations.push({
    type: integrationType
  })
  await account.save();
  return account;
}

export async function addCredential(account, integrationID, key, value) {
  const integration = account.integrations.id(integrationID);
  integration.credentials.set(key, value);
  await account.save();
  return account;
}
export async function removeCredential(account, integrationID, key) {
  const integration = account.integrations.id(integrationID);
  integration.credentials.delete(key);
  await account.save();
  return account;
}

export async function getAccountDetails(account) {
  //
}

export async function getAccountById(id) {
  //
}
