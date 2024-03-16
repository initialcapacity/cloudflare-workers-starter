import {D1Database as D1DatabaseType} from "@cloudflare/workers-types"

export const clear = async (db: D1DatabaseType): Promise<void> => {
    await db.exec('delete from memberships')
    await db.exec('delete from accounts')
    await db.exec('delete from users')
}
