import {
    basics,
    combine,
    cookieSession,
    forbidden,
    signedCookies,
    found,
    WorkerRouter
} from '@worker-tools/shed';
import { oauthClient } from './auth/oauthClient';
import { isAuthorized } from './auth/authorization';

export interface Env {
    APP: Fetcher,
    SECRET: string,
    CLIENT_ID: string,
    CLIENT_SECRET: string,
    BASE_URL: string,
    AUTHORIZED_DOMAIN: string,
}

type Session = {
    email: string | null
}

export default {
    fetch: async (request: Request, env: Env, ctx: ExecutionContext) => {
        const middleware = combine(
            basics(),
            signedCookies({ secret: env.SECRET }),
            cookieSession<Session>({
                cookieName: 'starter-session',
                expirationTtl: 60 * 60 * 24 * 7,
                defaultSession: { email: null }
            })
        );

        const client = oauthClient({
            clientId: env.CLIENT_ID,
            clientSecret: env.CLIENT_SECRET,
            redirectUrl: `${env.BASE_URL}/callback`,
            authUrl: `https://accounts.google.com/o/oauth2/auth`,
            tokenUrl: `https://oauth2.googleapis.com/token`,
            userUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
        });
        const authorized = isAuthorized(env.AUTHORIZED_DOMAIN)

        const router = new WorkerRouter(middleware)
            .get('/login', async (_, { cookieStore }) => {
                const state = crypto.randomUUID();
                const authUrl = client.authUrl(state);
                await cookieStore.set('starter-state', state);
                return found(authUrl);
            })
            .get('/callback', async (_, { searchParams, session, cookieStore }) => {
                const code = searchParams.get('code') ?? '';
                const state = searchParams.get('state') ?? '';
                const savedState = (await cookieStore.get('starter-state'))?.value ?? '';
                await cookieStore.delete('starter-state');

                const tokenResult = await client.fetchToken(code, state, savedState);
                if (!tokenResult.success) {
                    console.log(`failed fetching token: ${tokenResult.error}`);
                    return found('/');
                }

                const emailResult = await client.fetchEmail(tokenResult.token);
                if (!emailResult.success) {
                    console.log(`failed fetching email: ${emailResult.error}`);
                    return found('/');
                }

                const email = emailResult.email;
                if (!authorized(email)) {
                    return forbidden(`User ${email} not authorized`);
                }

                session.email = email;
                return found('/');
            })
            .get('/', req => env.APP.fetch(req))
            .get('/static/*', req => env.APP.fetch(req))
            .all('/*', (_, { session }) => {
                if (session.email === null) {
                    return found('/login');
                }

                const augmentedRequest = new Request(request);
                augmentedRequest.headers.append('starter-proxied', 'true');
                augmentedRequest.headers.append('starter-user', session.email);
                return env.APP.fetch(augmentedRequest);
            });

        return router.fetch(request);
    }
};
