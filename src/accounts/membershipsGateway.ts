type MembershipRecord = {
    id: number
    userId: number
    accountId: number
}

export type MembershipsGateway = {
    create: (userId: number, accountId: number) => Promise<MembershipRecord>
}

export const membershipsGateway = (db: D1Database): MembershipsGateway => ({
    create: async (userId: number, accountId: number): Promise<MembershipRecord> => {
        const record = await db.prepare(`
            insert into memberships (user_id, account_id, owner)
            values (?, ?, true)
            returning id, user_id, account_id
        `).bind(userId, accountId).first()

        if (record === null) {
            throw new Error("unable to create membership")
        }

        return {
            id: record["id"] as number,
            userId: record["user_id"] as number,
            accountId: record["account_id"] as number,
        }
    }
})
