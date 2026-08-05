# nestjs-minimal-app

Minimal NestJS 11 recipe with PostgreSQL via TypeORM, running on Zerops `nodejs@22` with migrations and seed gated by `zsc execOnce` per deploy version.

## Zerops service facts

- HTTP port: `3000`
- Siblings: `db` (PostgreSQL) — env: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`
- Runtime base: `nodejs@22`

## Zerops dev

`setup: dev` idles on `zsc noop --silent`; the agent starts the dev server.

- Dev command: `npm run start:dev`
- In-container rebuild without deploy: `npm run build`

**All platform operations (start/stop/status/logs of the dev server, deploy, env / scaling / storage / domains) go through the Zerops development workflow via `zcp` MCP tools. Don't shell out to `zcli`.**

## Notes

- Never create `.env` files — Zerops injects env vars at the OS level; a `.env` file shadows them with empty values.
- The app must bind `0.0.0.0`, not `localhost` — the L7 balancer routes to the container's VXLAN IP.
- Migrations and seed run via `zsc execOnce ${appVersionId}` so only one container runs them per deploy version.
