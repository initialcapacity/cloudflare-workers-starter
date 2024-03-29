import {env} from "cloudflare:test";
import {membershipsGateway} from "../../src/accounts/membershipsGateway";
import {clear} from "../support/databaseSupport";
import {describe, test, expect, beforeEach} from "vitest";

describe("membershipsGateway", async () => {
    const db = env.DB

    beforeEach(async () => await clear(db));

    test("create", async () => {
        const gateway = membershipsGateway(db)

        await db.exec("insert into users (id, email) values (11, 'test@example.com')")
        await db.exec("insert into accounts (id, name) values (22, 'Some account')")

        const result = await gateway.create(11, 22)

        expect(result["userId"]).toEqual(11)
        expect(result["accountId"]).toEqual(22)
    });
});
