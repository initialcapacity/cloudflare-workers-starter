import {unstable_dev, UnstableDevWorker} from 'wrangler';

describe('Starter app', () => {
    let worker: UnstableDevWorker;

    beforeAll(async () => {
        worker = await unstable_dev('src/index.ts', {
            experimental: {disableExperimentalWarning: true},
            vars: {
                SECRET: 'test-secret'
            }
        });
    });

    afterAll(async () => {
        await worker.stop();
    });

    test('loads the index', async () => {
        const response = await worker.fetch('/');

        expect(response.status).toEqual(200)
        const text = await response.text();
        expect(text).toContain('Welcome');
        expect(text).toContain('log in');
    });

    test('loads the dashboard', async () => {
        const response = await worker.fetch('/dashboard', {
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
        const response = await worker.fetch('/dashboard');

        expect(response.status).toEqual(403)
        const text = await response.text();
        expect(text).toContain('unauthorized');
    });
});
