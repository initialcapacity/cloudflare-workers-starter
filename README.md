# Cloudflare Workers Starter

A starter app to deploy to [Cloudflare Workers](https://developers.cloudflare.com/workers/).
See it in action at [starterapp.work](https://starterapp.work).

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
