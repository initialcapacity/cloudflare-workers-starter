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

    it('loads', async () => {
        const response = await worker.fetch('/', {
            headers: {'starter-proxied': 'true'}
        });

        expect(response.status).toEqual(200)
        const text = await response.text();
        expect(text).toContain('Workers Starter');
    });

    it('blocks requests without a proxied header', async () => {
        const response = await worker.fetch('/');

        expect(response.status).toEqual(403)
        const text = await response.text();
        expect(text).toContain('unauthorized');
    });
});
