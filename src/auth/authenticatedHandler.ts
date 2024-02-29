import {Context, Env} from "hono";
import {Session} from "./session";
import {isSet, UserSession} from "../userSession";
import {createFactory} from "hono/factory";
import {accountsService} from "../accounts/accountsService";
import {accountsGateway} from "../accounts/accountsGateway";
import {usersGateway} from "../accounts/usersGateway";
import {membershipsGateway} from "../accounts/membershipsGateway";

type CustomEnv = {
    Bindings: { DB: D1Database },
    Variables: { session: Session<UserSession> }
};

const factory = createFactory<Env & CustomEnv>()


type UserContext = {
    email: string
    accountName: string,
}

export const authenticated = (handler: (c: Context<Env & CustomEnv>, userContext: UserContext) => Response | Promise<Response>) =>
    factory.createHandlers(async (c) => {
        const proxied = c.req.header('starter-proxied') === 'true';
        const email = c.req.header('starter-user')

        if (!proxied || email === undefined || email === '') {
            return c.text('unauthorized', 403)
        }
        c.get('session')
        const session = c.get('session');
        const userSession = await session.get();

        if (!isSet(userSession)) {
            const db = c.env.DB
            const service = accountsService(
                accountsGateway(db),
                usersGateway(db),
                membershipsGateway(db),
            )

            const userAccount = await service.createOrFindUserAccount(email)
            await session.set({
                userId: userAccount.id, email: userAccount.email,
                accountId: userAccount.accountId, accountName: userAccount.accountName,
            })

            return handler(c, {email: userAccount.email, accountName: userAccount.accountName})
        }

        return handler(c, {email: userSession.email, accountName: userSession.accountName})
    })[0]
