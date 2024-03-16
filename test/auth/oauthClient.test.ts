import { fetchMock } from "cloudflare:test";
import { oauthClient } from '../../src/auth/oauthClient';
import { describe, test, expect, beforeAll, afterEach } from 'vitest';

describe('oauthClient', () => {
    const client = oauthClient({
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        authUrl: 'https://auth.example.com',
        tokenUrl: 'https://token.example.com',
        redirectUrl: 'https://redirect.example.com',
        userUrl: 'https://user.example.com'
    });

    beforeAll(() => {
        fetchMock.activate();
        fetchMock.disableNetConnect();
    });

    afterEach(() => fetchMock.assertNoPendingInterceptors());

    test('authUrl', () => {
        const authUrl = new URL(client.authUrl('some-state'));

        expect(authUrl.host).toEqual('auth.example.com');
        const searchParams = authUrl.searchParams;
        expect(searchParams.get('client_id')).toEqual('clientId');
        expect(searchParams.get('redirect_uri')).toEqual('https://redirect.example.com');
        expect(searchParams.get('scope')).toEqual('openid profile email');
        expect(searchParams.get('response_type')).toEqual('code');
        expect(searchParams.get('state')).toEqual('some-state');
    });

    describe('fetchToken', async () => {
        test('success', async () => {
            fetchMock.get('https://token.example.com')
                .intercept({ method: 'POST', path: '/' })
                .reply(201, JSON.stringify({
                    access_token: 'some-token'
                }));

            const result = await client.fetchToken('some-code', 'some-state', 'some-state');

            expect(result).toEqual({ success: true, token: 'some-token' });
        });

        test('failure', async () => {
            fetchMock.get('https://token.example.com')
                .intercept({ method: 'POST', path: '/' })
                .reply(500, 'bad news');

            const result = await client.fetchToken('some-code', 'some-state', 'some-state');

            expect(result).toEqual({ success: false, error: 'failed to request token' });
        });

        test('state mismatch', async () => {
            expect(await client.fetchToken('some-code', 'some-state', 'some-other-state')).toEqual({
                success: false,
                error: 'state doesn\'t match'
            });
            expect(await client.fetchToken('some-code', '', '')).toEqual({
                success: false,
                error: 'state doesn\'t match'
            });
        });
    });

    describe('fetchEmail', async () => {
        test('success', async () => {
            fetchMock.get('https://user.example.com')
                .intercept({ method: 'GET', path: '/' })
                .reply(200, JSON.stringify({ email: 'test@example.com' }));

            const result = await client.fetchEmail('some-token');

            expect(result).toEqual({ success: true, email: 'test@example.com' });
        });

        test('failure', async () => {
            fetchMock.get('https://user.example.com')
                .intercept({ method: 'GET', path: '/' })
                .reply(500, 'bad news');

            const result = await client.fetchEmail('some-token');

            expect(result).toEqual({ success: false, error: 'failed to fetch user' });
        });
    });
});
