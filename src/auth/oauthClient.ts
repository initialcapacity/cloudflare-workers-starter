type OAuthError = { success: false, error: string };

type TokenResult =
    | { success: true, token: string }
    | OAuthError

type EmailResult =
    | { success: true, email: string }
    | OAuthError

export type OAuthClient = {
    authUrl: (state: string) => string
    fetchToken: (code: string, state: string, savedState: string) => Promise<TokenResult>
    fetchEmail: (token: string) => Promise<EmailResult>
}

type OAuthClientParams = {
    clientId: string,
    clientSecret: string,
    authUrl: string,
    tokenUrl: string,
    redirectUrl: string,
    userUrl: string,
}

export const oauthClient = (
    {
        clientId,
        clientSecret,
        redirectUrl,
        authUrl,
        tokenUrl,
        userUrl,
    }: OAuthClientParams): OAuthClient => {
    return {
        authUrl: (state: string) => {
            const params = new URLSearchParams({
                client_id: clientId,
                redirect_uri: redirectUrl,
                scope: 'openid profile email',
                response_type: 'code',
                state,
            }).toString();

            return `${authUrl}?${params}`;
        },
        fetchToken: async (code: string, state: string, savedState: string) => {
            if (savedState === '' || savedState !== state) {
                console.log(`savedState (${savedState}) doesn't match state (${state})`);
                return { success: false, error: 'state doesn\'t match' };
            }

            const tokenResponse = await fetch(tokenUrl, {
                method: 'POST',
                body: JSON.stringify({
                    client_id: clientId,
                    client_secret: clientSecret,
                    code,
                    grant_type: 'authorization_code',
                    redirect_uri: redirectUrl
                })
            });
            if (tokenResponse.status > 299) {
                console.log(`token response failed: ${tokenResponse.status}`);
                console.log(await tokenResponse.text());
                return { success: false, error: 'failed to request token' };
            }

            const tokenBody: any = await tokenResponse.json();
            return { success: true, token: tokenBody['access_token'] };
        },
        fetchEmail: async (token: string) => {
            const userResponse = await fetch(userUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (userResponse.status > 299) {
                console.log(`user response failed: ${userResponse.status}`);
                console.log(await userResponse.text());
                return { success: false, error: 'failed to fetch user' };
            }

            const userBody: any = await userResponse.json();
            const email: string = userBody['email'] ?? '';
            return { success: true, email };
        }
    };
};
