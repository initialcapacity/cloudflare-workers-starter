import {unstable_dev, UnstableDevWorker} from 'wrangler';

describe('Starter app', () => {
    let worker: UnstableDevWorker;

    beforeAll(async () => {
        worker = await unstable_dev('src/index.ts', {
            experimental: {disableExperimentalWarning: true}
        });
    });

    afterAll(async () => {
        await worker.stop();
    });

    it('loads the index', async () => {
        const response = await worker.fetch('/');

        expect(response.status).toEqual(200)
        const text = await response.text();
        expect(text).toContain('Workers Starter');
        expect(text).toContain('log in');
    });

    it('loads the dashboard', async () => {
        const response = await worker.fetch('/dashboard', {
            headers: {
                'starter-proxied': 'true',
                'starter-user': 'test@example.com',
            }
        });

        expect(response.status).toEqual(200)
        const text = await response.text();
        expect(text).toContain('Workers Starter');
        expect(text).toContain('Welcome, test@example.com!');
    });

    it('blocks requests to the dashboard without a proxied header', async () => {
        const response = await worker.fetch('/dashboard');

        expect(response.status).toEqual(403)
        const text = await response.text();
        expect(text).toContain('unauthorized');
    });
});
