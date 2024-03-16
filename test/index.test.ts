import { SELF as worker } from "cloudflare:test";
import { describe, test, expect } from "vitest";

describe('Starter app', () => {
    test('loads the index', async () => {
        const response = await worker.fetch('https://example.com/');

        expect(response.status).toEqual(200)
        const text = await response.text();
        expect(text).toContain('Welcome');
        expect(text).toContain('log in');
    });

    test('loads the dashboard', async () => {
        const response = await worker.fetch('https://example.com/dashboard', {
            headers: {
                'starter-proxied': 'true',
                'starter-user': 'test@example.com',
            }
        });

        expect(response.status).toEqual(200)
        const text = await response.text();
        expect(text).toContain('Dashboard');
        expect(text).toContain('Welcome, test@example.com!');
    });

    test('blocks requests to the dashboard without a proxied header', async () => {
        const response = await worker.fetch('https://example.com/dashboard');

        expect(response.status).toEqual(403)
        const text = await response.text();
        expect(text).toContain('unauthorized');
    });
});
