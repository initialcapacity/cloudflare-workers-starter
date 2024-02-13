type MembershipRecord = {
    id: string
    userId: string
    accountId: string
}

export type MembershipsGateway = {
    create: (userId: string, accountId: string) => Promise<MembershipRecord>
}

export const membershipsGateway = (db: D1Database): MembershipsGateway => ({
    create: async (userId: string, accountId: string): Promise<MembershipRecord> => {
        const record = await db.prepare(`
            insert into memberships (user_id, account_id, owner)
            values (?, ?, true)
            returning id, user_id, account_id
        `).bind(userId, accountId).first()

        if (record === null) {
            throw new Error("unable to create membership")
        }

        return {
            id: record["id"] as string,
            userId: record["user_id"] as string,
            accountId: record["account_id"] as string,
        }
    }
})
