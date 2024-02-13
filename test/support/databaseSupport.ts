import fs from "fs";
import Database from "better-sqlite3";
import {D1Database, D1DatabaseAPI} from "@miniflare/d1";
import {D1Database as D1DatabaseType} from "@cloudflare/workers-types"

const migrate = async (db: D1Database): Promise<void> => {
    const sql = fs.readFileSync('migrations/0000_create_user_tables.sql', {encoding: "utf8"});
    const statements = sql.replaceAll('\n', '').split(';').filter(statement => statement !== '');
    for (const statement of statements) {
        await db.exec(`${statement};`)
    }
}

export const createDb = async (): Promise<D1DatabaseType> => {
    fs.rmSync('test/support/test.sqlite', {force: true})
    const sqlite = new Database('test/support/test.sqlite');
    const api = new D1DatabaseAPI(sqlite)
    const db = new D1Database(api);
    await migrate(db);
    return db as D1DatabaseType
}

export const clear = async (db: D1DatabaseType): Promise<void> => {
    await db.exec('delete from memberships')
    await db.exec('delete from accounts')
    await db.exec('delete from users')
}
