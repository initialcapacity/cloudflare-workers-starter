import {env} from "cloudflare:test";
import {accountsGateway} from "../../src/accounts/accountsGateway";
import {describe, test, beforeEach, expect} from "vitest";
import {clear} from "../support/databaseSupport";

describe("accountsGateway", async () => {
    const db = env.DB
    const gateway = accountsGateway(db)

    beforeEach(async () => await clear(db));

    test("create", async () => {
        const result = await gateway.create("some account")
        expect(result["name"]).toEqual("some account")

        const saved = await db.prepare("select name from accounts").first()
        expect(saved).toEqual({name: "some account"})
    });

    test("findForUser", async () => {
        await db.exec("insert into users (id, email) values (11, 'test@example.com')")
        await db.exec("insert into accounts (id, name) values (22, 'Some account')")
        await db.exec("insert into memberships (user_id, account_id, owner) values (11, 22, true)")

        const account = await gateway.findForUser(11)

        expect(account).toEqual({id: 22, name: 'Some account'})
    });

    test("findForUser not found", async () => {
        await db.exec("insert into users (id, email) values (11, 'test@example.com')")

        const account = await gateway.findForUser(11)

        expect(account).toBeNull()
    });
});
