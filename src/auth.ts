import {OAuthClient, oauthClient} from './auth/oauthClient';
import {isAuthorized} from './auth/authorization';
import {Hono} from "hono";
import {deleteCookie, getSignedCookie, setSignedCookie} from "hono/cookie";
import {session, Session} from "./auth/session";

export type Bindings = {
    APP: Fetcher,
    SECRET: string,
    CLIENT_ID: string,
    CLIENT_SECRET: string,
    BASE_URL: string,
    AUTHORIZED_DOMAIN: string,
}

type EmailSession = {
    email: string | null
}

export type Variables = {
    oauthClient: OAuthClient
    session: Session<EmailSession>
}

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>();

app.use(async (c, next) => {
    c.set('oauthClient', oauthClient({
        clientId: c.env.CLIENT_ID,
        clientSecret: c.env.CLIENT_SECRET,
        redirectUrl: `${c.env.BASE_URL}/callback`,
        authUrl: `https://accounts.google.com/o/oauth2/auth`,
        tokenUrl: `https://oauth2.googleapis.com/token`,
        userUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
    }))

    await next()
})

app.use(async (c, next) => {
    c.set('session', session<EmailSession, typeof c>('starter-email', c.env.SECRET, c, {email: null}))

    await next()
})

app.get('/login', async c => {
    const state = crypto.randomUUID();
    const authUrl = c.get('oauthClient').authUrl(state);
    await setSignedCookie(c, 'starter-state', state, c.env.SECRET)
    return c.redirect(authUrl);
})

app.get('/callback', async c => {
    const code = c.req.query('code') ?? '';
    const state = c.req.query('state') ?? '';
    const savedState = (await getSignedCookie(c, c.env.SECRET, 'starter-state')) || ''
    deleteCookie(c, 'starter-state')
    const client = c.get('oauthClient');
    const authorized = isAuthorized(c.env.AUTHORIZED_DOMAIN)

    const tokenResult = await client.fetchToken(code, state, savedState);
    if (!tokenResult.success) {
        console.log(`failed fetching token: ${tokenResult.error}`);
        return c.redirect('/');
    }

    const emailResult = await client.fetchEmail(tokenResult.token);
    if (!emailResult.success) {
        console.log(`failed fetching email: ${emailResult.error}`);
        return c.redirect('/');
    }

    const email = emailResult.email;
    if (!authorized(email)) {
        return c.text(`User ${email} not authorized`, {status: 403});
    }

    await c.get('session').set({email})
    return c.redirect('/');
})

app.get('/', async c => {
    const {email} = await c.get('session').get()
    return email ? c.redirect('/dashboard') : c.env.APP.fetch(c.req.raw)
})

app.get('/static/*', async c => c.env.APP.fetch(c.req.raw))

app.get('/log-out', async c => {
    deleteCookie(c, 'starter-email')
    return c.redirect('/')
})

app.all('/*', async c => {
    const {email} = await c.get('session').get()
    if (email === null) {
        return c.redirect('/login');
    }

    const augmentedRequest = new Request(c.req.raw);
    augmentedRequest.headers.append('starter-proxied', 'true');
    augmentedRequest.headers.append('starter-user', email);
    return c.env.APP.fetch(augmentedRequest);
})

export default app;
