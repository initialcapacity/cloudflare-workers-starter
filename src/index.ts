import {basics, HTMLResponse, WorkerRouter} from "@worker-tools/shed";
import {layoutHtml} from "./templates/layoutHtml";
import {authenticated} from "./auth/authenticatedHandler";
import {indexHtml} from "./templates/indexHtml";
import {dashboardHtml} from "./templates/dashboardHtml";
import {getAssetFromKV} from "@cloudflare/kv-asset-handler";
// @ts-ignore
import manifestJSON from "__STATIC_CONTENT_MANIFEST";

export interface Env {
    __STATIC_CONTENT: KVNamespace,
    __STATIC_CONTENT_MANIFEST: string,
}

const assetManifest = JSON.parse(manifestJSON);

export default {
    fetch: async (request: Request, env: Env, ctx: ExecutionContext): Promise<Response> => {
        try {
            return await getAssetFromKV(
                {
                    request,
                    waitUntil: ctx.waitUntil.bind(ctx),
                },
                {
                    ASSET_NAMESPACE: env.__STATIC_CONTENT,
                    ASSET_MANIFEST: assetManifest,
                }
            );
        } catch (e) {

        }


        return new WorkerRouter(basics())
            .get('/', () => new HTMLResponse(layoutHtml(indexHtml)))
            .get('/dashboard', authenticated((_, {email}) => new HTMLResponse(layoutHtml(dashboardHtml(email))))).fetch(request);
    },
};
