type UserRecord = {
    id: number
    email: string
}

export type UsersGateway = {
    find: (email: string) => Promise<UserRecord | null>
    create: (email: string) => Promise<UserRecord>
}

export const usersGateway = (db: D1Database): UsersGateway => ({
    find: async (email: string): Promise<UserRecord | null> => {
        const record = await db.prepare('select id, email from users where email = ?').bind(email).first()
        if (record === null) return record

        return {
            id: record["id"] as number,
            email: record["email"] as string,
        }
    },
    create: async (email: string): Promise<UserRecord> => {
        const record = await db.prepare('insert into users (email) values (?) returning id, email').bind(email).first()
        if (record === null) {
            throw new Error("unable to create user")
        }

        return {
            id: record["id"] as number,
            email: record["email"] as string,
        }
    }
})
