import {basics, html, HTMLResponse, WorkerRouter} from "@worker-tools/shed";
import {layoutHtml} from "./templates/layoutHtml";
import {authenticated} from "./auth/authenticatedHandler";

export interface Env {
}

export default {
    fetch: async (request: Request, env: Env, ctx: ExecutionContext): Promise<Response> =>
        new WorkerRouter(basics())
            .get('/', () => new HTMLResponse(layoutHtml(html`
                <h1>Workers Starter</h1>
                <p>Please <a href="/dashboard">log in</a></p>
            `)))
            .get('/dashboard', authenticated((_, {email}) => new HTMLResponse(layoutHtml(html`
                <h1>Workers Starter</h1>
                <p>Welcome, ${email}!</p>
            `)))).fetch(request),
};
