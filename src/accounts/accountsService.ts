import {MembershipsGateway} from "./membershipsGateway";
import {UsersGateway} from "./usersGateway";
import {AccountRecord, AccountsGateway} from "./accountsGateway";

export type UserAccount = {
    id: string
    email: string
    accountId: string
    accountName: string
}

export type AccountsService = {
    createOrFindUserAccount: (email: string) => Promise<UserAccount>
}

export const accountsService = (
    accountsGateway: AccountsGateway,
    usersGateway: UsersGateway,
    membershipsGateway: MembershipsGateway,
): AccountsService => {
    const createAccountFor = async (userId: string, email: string): Promise<AccountRecord> => {
        const account = await accountsGateway.create(`${email} account`)
        await membershipsGateway.create(userId, account.id)
        return account
    }

    return ({
        createOrFindUserAccount: async (email: string): Promise<UserAccount> => {
            const user = await usersGateway.find(email) ?? await usersGateway.create(email)
            const account = await accountsGateway.findForUser(user.id) ?? await createAccountFor(user.id, user.email)

            return {
                ...user,
                accountId: account.id,
                accountName: account.name,
            }
        }
    });
}
