import {env} from "cloudflare:test";
import {usersGateway} from "../../src/accounts/usersGateway";
import {clear} from "../support/databaseSupport";
import {describe, test, beforeEach, expect} from "vitest";

describe("usersGateway", async () => {
    const db = env.DB
    const gateway = usersGateway(db)

    beforeEach(async () => {
        await clear(db);
    });

    test("create", async () => {
        const result = await gateway.create("test@example.com")
        expect(result["email"]).toEqual("test@example.com")

        const saved = await db.prepare("select email from users").first()
        expect(saved).toEqual({email: "test@example.com"})
    });

    test("find", async () => {
        await db.exec("insert into users (id, email) values (33, 'test@example.com')")

        const user = await gateway.find("test@example.com")
        expect(user).toEqual({id: 33, email: "test@example.com"})
    });

    test("find not found", async () => {
        const user = await gateway.find("test@example.com")
        expect(user).toBeNull()
    });
});
