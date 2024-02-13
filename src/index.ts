import {basics, combine, cookieSession, HTMLResponse, signedCookies, WorkerRouter} from "@worker-tools/shed";
import {authenticated} from "./auth/authenticatedHandler";
import {indexHtml} from "./templates/indexHtml";
import {dashboardHtml} from "./templates/dashboardHtml";
import {getAssetFromKV} from "@cloudflare/kv-asset-handler";
// @ts-ignore
import manifestJSON from "__STATIC_CONTENT_MANIFEST";
import {authenticatedLayout, unauthenticatedLayout} from "./templates/layoutHtml";
import {emptySession, Session} from "./auth/session";
import {accountsService} from "./accounts/accountsService";
import {usersGateway} from "./accounts/usersGateway";
import {accountsGateway} from "./accounts/accountsGateway";
import {membershipsGateway} from "./accounts/membershipsGateway";

export interface Env {
    __STATIC_CONTENT: KVNamespace,
    __STATIC_CONTENT_MANIFEST: string,
    DB: D1Database,
    SECRET: string,
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

        const middleware = combine(
            basics(),
            signedCookies({secret: env.SECRET}),
            cookieSession<Session>({
                cookieName: 'starter-session',
                expirationTtl: 60 * 60 * 24 * 7,
                defaultSession: emptySession
            })
        );

        const service = accountsService(
            accountsGateway(env.DB),
            usersGateway(env.DB),
            membershipsGateway(env.DB),
        )

        return new WorkerRouter(middleware)
            .get('/', () => new HTMLResponse(unauthenticatedLayout(indexHtml)))
            .get('/dashboard', authenticated(service, (_, {
                email,
                accountName
            }) => new HTMLResponse(authenticatedLayout({
                email,
                accountName
            }, dashboardHtml(email))))).fetch(request);
    },
};
