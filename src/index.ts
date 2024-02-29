// @ts-ignore
import manifest from "__STATIC_CONTENT_MANIFEST";
import {indexHtml} from "./templates/indexHtml";
import {dashboardHtml} from "./templates/dashboardHtml";
import {authenticatedLayout, unauthenticatedLayout} from "./templates/layoutHtml";

import {Hono} from "hono";
import {serveStatic} from "hono/cloudflare-workers";
import {session, Session} from "./auth/session";
import {UserSession} from "./userSession";
import {authenticated} from "./auth/authenticatedHandler";

type Bindings = {
    __STATIC_CONTENT: KVNamespace,
    __STATIC_CONTENT_MANIFEST: string,
    DB: D1Database,
    SECRET: string,
}

type Variables = {
    session: Session<UserSession>
}

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>();
app.use(async (c, next) => {
    c.set('session', session<UserSession, typeof c>('starter-session', c.env.SECRET, c,
        {userId: null, email: null, accountId: null, accountName: null}
    ))
    await next()
})

app.get('/static/*', serveStatic({root: './', manifest}))
app.get('/', (c) => c.html(unauthenticatedLayout(indexHtml)))
app.get('/dashboard', authenticated((c, email, accountName) =>
    c.html(authenticatedLayout({email, accountName}, dashboardHtml(email))))
);

export default app;
