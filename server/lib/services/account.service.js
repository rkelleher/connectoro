import { Account } from "../models/account.model.js"

export function findByIntegrationType(integrationType, isSerchMany = true) {
    const searcher = isSerchMany 
        ? 'find'
        : 'findOne';
    
    return Account[searcher]({
        integrations: {
            $elemMatch: {
                integrationType
            }
        }
    })
}
