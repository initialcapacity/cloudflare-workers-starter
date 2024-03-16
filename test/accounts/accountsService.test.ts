import {env} from "cloudflare:test";
import {clear} from "../support/databaseSupport";
import {accountsGateway} from "../../src/accounts/accountsGateway";
import {describe, test, expect, beforeEach} from "vitest";
import {accountsService} from "../../src/accounts/accountsService";
import {membershipsGateway} from "../../src/accounts/membershipsGateway";
import {usersGateway} from "../../src/accounts/usersGateway";

describe('accountsService', async () => {
    const db = env.DB
    const service = accountsService(
        accountsGateway(db),
        usersGateway(db),
        membershipsGateway(db),
    )

    beforeEach(async () => await clear(db));

    test('createOrFindUserAccount', async () => {
        const userAccount = await service.createOrFindUserAccount("test@example.com")

        expect(userAccount.email).toEqual("test@example.com")
        expect(userAccount.accountName).toEqual("test@example.com account")
    })

    test('createOrFindUserAccount user exists', async () => {
        await db.exec("insert into users (email) values ('test@example.com')")

        const userAccount = await service.createOrFindUserAccount("test@example.com")

        expect(userAccount.email).toEqual("test@example.com")
        expect(userAccount.accountName).toEqual("test@example.com account")
    })

    test('createOrFindUserAccount account exists', async () => {
        await db.exec("insert into users (id, email) values (11, 'test@example.com')")
        await db.exec("insert into accounts (id, name) values (22, 'Some account')")
        await db.exec("insert into memberships (user_id, account_id, owner) values (11, 22, true)")

        const userAccount = await service.createOrFindUserAccount("test@example.com")

        expect(userAccount.email).toEqual("test@example.com")
        expect(userAccount.accountName).toEqual("Some account")
    })
});
