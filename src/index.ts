import {basics, html, HTMLResponse, WorkerRouter} from "@worker-tools/shed";
import {layoutHtml} from "./templates/layoutHtml";

export interface Env {
}

export default {
    fetch: async (request: Request, env: Env, ctx: ExecutionContext): Promise<Response> => {
        if (request.headers.get('starter-proxied') !== 'true') {
            return new Response('unauthorized', { status: 403 });
        }

        const router = new WorkerRouter(basics())
            .get('/', () => new HTMLResponse(layoutHtml(html`<h1>Workers Starter</h1>`)))

        return router.fetch(request);
    },
};
