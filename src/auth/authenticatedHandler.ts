import {Awaitable, Handler, RouteContext} from "@worker-tools/shed";

type EmailContext = {
    email: string
}

export const authenticated = <X extends RouteContext>(handler: Handler<X & EmailContext>): Handler<X> => (request: Request, ctx: X): Awaitable<Response> => {
    const proxied = request.headers.get('starter-proxied') === 'true';
    const email = request.headers.get('starter-user')
    if (!proxied || email === null || email === '') {
        return new Response('unauthorized', { status: 403 });
    }

    return handler(request, Object.assign(ctx, {email}))
}
