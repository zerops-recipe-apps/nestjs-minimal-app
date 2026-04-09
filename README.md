# NestJS Minimal Recipe App

<!-- #ZEROPS_EXTRACT_START:intro# -->

A minimal NestJS application with a PostgreSQL connection,
demonstrating database connectivity, TypeORM migrations, and a health endpoint.
Used within [NestJS Minimal recipe](https://app.zerops.io/recipes/nestjs-minimal) for [Zerops](https://zerops.io) platform.

<!-- #ZEROPS_EXTRACT_END:intro# -->

[![Deploy on Zerops](https://github.com/zeropsio/recipe-shared-assets/blob/main/deploy-button/light/deploy-button.svg)](https://app.zerops.io/recipes/nestjs-minimal?environment=small-production)

![NestJS cover](https://github.com/zeropsio/recipe-shared-assets/blob/main/covers/svg/cover-nestjs.svg)

## Integration Guide

<!-- #ZEROPS_EXTRACT_START:integration-guide# -->

### 1. Adding `zerops.yaml`
The main configuration file — place at your repository root. It tells Zerops how to build, deploy and run your NestJS app.

```yaml
zerops:
  # Production setup — compile TypeScript, deploy only the
  # compiled output with production dependencies.
  - setup: prod
    build:
      base: nodejs@22

      buildCommands:
        # npm ci locks to package-lock.json for reproducible
        # builds — safer than npm install in CI/CD pipelines.
        - npm ci
        - npm run build
        # Strip devDependencies (TypeScript, testing, linting)
        # after compilation — runtime needs only production deps.
        - npm prune --omit=dev

      deployFiles:
        - ./dist          # compiled JS output
        - ./node_modules  # production dependencies only
        - ./package.json

      # Cache node_modules between builds to skip re-downloading
      # unchanged packages on every build trigger.
      cache:
        - node_modules

    # Readiness check — L7 balancer holds traffic until the
    # new container responds, preventing requests to containers
    # that are still initializing TypeORM or running migrations.
    deploy:
      readinessCheck:
        httpGet:
          port: 3000
          path: /api/health

    run:
      base: nodejs@22

      # Migrations and seeding run once per deploy version —
      # execOnce gates concurrent containers so only one runs
      # the command while others wait for completion.
      # --retryUntilSuccessful handles the brief window when
      # the database port is not yet accepting connections.
      initCommands:
        - zsc execOnce ${appVersionId} --retryUntilSuccessful -- node dist/migrate.js
        - zsc execOnce ${appVersionId} --retryUntilSuccessful -- node dist/seed.js

      ports:
        - port: 3000
          httpSupport: true

      envVariables:
        NODE_ENV: production
        # Cross-service references — resolved at container start
        # from the 'db' service's auto-generated credentials.
        DB_NAME: ${db_dbName}
        DB_HOST: ${db_hostname}
        DB_PORT: ${db_port}
        DB_USER: ${db_user}
        DB_PASS: ${db_password}

      start: node dist/main.js

      # Health check restarts unresponsive containers — catches
      # process hangs and lost database connections that would
      # otherwise serve errors indefinitely.
      healthCheck:
        httpGet:
          port: 3000
          path: /api/health

  # Development setup — deploy full source for interactive
  # development via SSH. Container stays idle until the
  # developer starts the app manually.
  - setup: dev
    build:
      base: nodejs@22

      buildCommands:
        # npm install (not ci) — works without a lock file,
        # giving flexibility during early development.
        - npm install

      # Deploy the entire working directory — source, config,
      # and node_modules with devDependencies included.
      deployFiles: ./

      cache:
        - node_modules

    run:
      base: nodejs@22
      # Ubuntu provides richer tooling (apt, curl, git, vim)
      # for interactive development sessions via SSH.
      os: ubuntu

      # Migrate and seed on every deploy — execOnce ensures
      # each command runs only once per deploy version even
      # when multiple containers exist.
      initCommands:
        - zsc execOnce ${appVersionId} --retryUntilSuccessful -- npx ts-node src/migrate.ts
        - zsc execOnce ${appVersionId} --retryUntilSuccessful -- npx ts-node src/seed.ts

      ports:
        - port: 3000
          httpSupport: true

      envVariables:
        NODE_ENV: development
        # Same cross-service references as prod — only the
        # mode flag (NODE_ENV) differs between setups.
        DB_NAME: ${db_dbName}
        DB_HOST: ${db_hostname}
        DB_PORT: ${db_port}
        DB_USER: ${db_user}
        DB_PASS: ${db_password}

      # Container stays idle — SSH in and run:
      #   npm run start:dev  (NestJS watch mode with hot-reload)
      # or
      #   npm run start      (single run via nest start)
      start: zsc noop --silent
```

### 2. Trust proxy and bind `0.0.0.0`

Zerops terminates SSL at its L7 balancer and forwards requests via reverse proxy. Without proxy trust, Express (under NestJS) misreports `req.ip` and `req.protocol`. Binding `localhost` causes 502 errors because the L7 balancer routes to the container's VXLAN IP.

```typescript
// in src/main.ts
const expressApp = app.getHttpAdapter().getInstance();
expressApp.set('trust proxy', true);
await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
```

### 3. Database configuration via environment variables

NestJS + TypeORM reads database credentials from environment variables injected by Zerops at container start. Never create `.env` files — they shadow OS-level vars with empty values.

```typescript
// in src/app.module.ts — TypeOrmModule.forRoot({...})
host: process.env.DB_HOST,
port: parseInt(process.env.DB_PORT, 10),
username: process.env.DB_USER,
password: process.env.DB_PASS,
database: process.env.DB_NAME,
```

<!-- #ZEROPS_EXTRACT_END:integration-guide# -->

<!-- #ZEROPS_EXTRACT_START:knowledge-base# -->

### Gotchas
- **No `.env` files on Zerops** — Zerops injects all environment variables as OS-level env vars. Creating a `.env` file with empty values will shadow the platform-injected values, causing silent connection failures. Delete any `.env` file from your deploy.
- **TypeORM `synchronize: true` in production** — never use `synchronize: true` in production as it auto-modifies the schema on every startup. Use a separate migration script executed via `initCommands` with `zsc execOnce` to ensure safe, one-time schema changes per deploy.
- **NestJS listens on `localhost` by default** — the `app.listen(port)` call without an explicit host binds to `127.0.0.1`. On Zerops, the L7 balancer routes to the container's VXLAN IP, so you must explicitly pass `'0.0.0.0'` as the second argument or the container returns 502.
- **`ts-node` needs devDependencies** — the dev setup uses `npx ts-node` for migration/seed scripts, which requires TypeScript and ts-node in node_modules. The dev `buildCommands` uses `npm install` (not `npm ci --omit=dev`) specifically for this reason.

<!-- #ZEROPS_EXTRACT_END:knowledge-base# -->
