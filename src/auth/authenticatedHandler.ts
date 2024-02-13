import {Awaitable, Handler, RouteContext} from "@worker-tools/shed";
import {AccountsService} from "../accounts/accountsService";
import {CookieSessionContext} from "@worker-tools/middleware/types/session";
import {isSet, Session, set} from "./session";

type UserContext = {
    email: string
    accountName: string,
}

export const authenticated = <X extends RouteContext & CookieSessionContext<Session>>(accountsService: AccountsService, handler: Handler<X & UserContext>): Handler<X> => async (request: Request, ctx: X): Promise<Response> => {
    const proxied = request.headers.get('starter-proxied') === 'true';
    const email = request.headers.get('starter-user')
    if (!proxied || email === null || email === '') {
        return new Response('unauthorized', {status: 403});
    }

    const session = ctx.session;
    if (!isSet(session) || session.email) {
        const userAccount = await accountsService.createOrFindUserAccount(email)
        set(session, userAccount)
    }

    return handler(request, Object.assign(ctx, {email: session.email!!, accountName: session.accountName!!}))
}
