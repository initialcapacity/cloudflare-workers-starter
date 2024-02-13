export type AccountRecord = {
    id: string
    name: string
}

export type AccountsGateway = {
    findForUser: (userId: string) => Promise<AccountRecord | null>
    create: (name: string) => Promise<AccountRecord>
}

export const accountsGateway = (db: D1Database): AccountsGateway => ({
    findForUser: async (userId: string): Promise<AccountRecord | null> => {
        const record = await db.prepare(`
            select a.id, a.name from accounts a 
                join main.memberships m on a.id = m.account_id
            where m.user_id = ?
        `).bind(userId).first()
        if (record === null) return record

        return {
            id: record["id"] as string,
            name: record["name"] as string,
        }
    },
    create: async (name: string): Promise<AccountRecord> => {
        const record = await db.prepare('insert into accounts (name) values (?) returning id, name').bind(name).first()
        if (record === null) {
            throw new Error("unable to create account")
        }

        return {
            id: record["id"] as string,
            name: record["name"] as string,
        }
    }
})
