import {basics, html, HTMLResponse, WorkerRouter} from "@worker-tools/shed";
import {layoutHtml} from "./templates/layoutHtml";
import {authenticated} from "./auth/authenticatedHandler";
import {indexHtml} from "./templates/indexHtml";
import {dashboardHtml} from "./templates/dashboardHtml";

export interface Env {
}

export default {
    fetch: async (request: Request, env: Env, ctx: ExecutionContext): Promise<Response> =>
        new WorkerRouter(basics())
            .get('/', () => new HTMLResponse(layoutHtml(indexHtml)))
            .get('/dashboard', authenticated((_, {email}) => new HTMLResponse(layoutHtml(dashboardHtml(email))))).fetch(request),
};
