# Cloudflare Workers Starter

A starter app that deploys a web application, authentication proxy, and background worker to [Cloudflare Workers](https://developers.cloudflare.com/workers/).

- Authentication
- Web app
- Background worker

## Technology stack

This codebase is written Typescript and runs on the [Cloudflare Workers runtime](https://developers.cloudflare.com/workers/runtime-apis/web-standards/),
an [open source runtime](https://github.com/cloudflare/workerd) similar to the [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker)
which differs from what runs on Node or your browser.
It uses a lightweight framework called [Hono](https://hono.dev/) for routing and templating.
The codebase is tested with [Vitest](https://vitest.dev/) and builds and deploys with [Wrangler](https://developers.cloudflare.com/workers/wrangler/).
A [GitHub action](.github/workflows/pipeline.yml) builds a zip artifact and deploys it to Cloudflare
Workers.
See the starter in action at [starterapp.work](https://starterapp.work) (login required).

## Run tests

1.  Create a `.dev.vars` file from the example.
    ```shell
    cp .dev.vars.example .dev.vars
    ```

1.  Edit the `.dev.vars` file to match your configuration.

1.  Migrate your local database.
    ```shell
    npm run migrations:apply
    ```

1.  Run tests with NPM.
    ```shell
    npm test
    ```

## Run the apps

1.  Run the scheduled worker.
    ```shell
    npm run worker:start
    ```

1.  Trigger the scheduled worker.
    ```shell
    npm run worker:trigger
    ```

1.  Run the auth app.
    ```shell
    npm run auth:start
    ```

1.  Run the app and visit [localhost:8788](http://localhost:8788).
    ```shell
    npm start
    ```

## Migrations

Create a migration with

```shell
npm run migrations:create -- $MIGRATION_NAME
```
