import {OAuthClient, oauthClient} from './auth/oauthClient';
import {isAuthorized} from './auth/authorization';
import {Hono} from "hono";
import {deleteCookie, getSignedCookie, setSignedCookie} from "hono/cookie";

export type Bindings = {
    APP: Fetcher,
    SECRET: string,
    CLIENT_ID: string,
    CLIENT_SECRET: string,
    BASE_URL: string,
    AUTHORIZED_DOMAIN: string,
}

export type Variables = {
    oauthClient: OAuthClient
}

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>();

app.use(async (c, next) => {
    const client = oauthClient({
        clientId: c.env.CLIENT_ID,
        clientSecret: c.env.CLIENT_SECRET,
        redirectUrl: `${c.env.BASE_URL}/callback`,
        authUrl: `https://accounts.google.com/o/oauth2/auth`,
        tokenUrl: `https://oauth2.googleapis.com/token`,
        userUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
    });

    c.set('oauthClient', client)

    await next()
})

app.get('/login', async c => {
    const state = crypto.randomUUID();
    const authUrl = c.get('oauthClient').authUrl(state);
    await setSignedCookie(c, 'starter-state', state, c.env.SECRET)
    return c.redirect(authUrl);
})

app.get('callback', async c => {
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

    await setSignedCookie(c, 'starter-email', email, c.env.SECRET)
    return c.redirect('/');
})

app.get('/', async c => {
    const email = (await getSignedCookie(c, c.env.SECRET, 'starter-email')) || null
    return email ? c.redirect('/dashboard') : c.env.APP.fetch(c.req.raw)
})

app.get('/static/*', async c => c.env.APP.fetch(c.req.raw))

app.get('/log-out', async c => {
    deleteCookie(c, 'starter-email')
    return c.redirect('/')
})

app.all('/*', async c => {
    const email = (await getSignedCookie(c, c.env.SECRET, 'starter-email')) || null
    if (email === null) {
        return c.redirect('/login');
    }

    const augmentedRequest = new Request(c.req.raw);
    augmentedRequest.headers.append('starter-proxied', 'true');
    augmentedRequest.headers.append('starter-user', email);
    return c.env.APP.fetch(augmentedRequest);
})

export default app;
