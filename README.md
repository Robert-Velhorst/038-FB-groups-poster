# Common Ground

Common Ground is a human-first workspace for finding useful conversations in Facebook communities, reviewing them in context, and choosing how to connect in your own voice.

The public introduction lives at `/`. The app is available at `/app.html`.

## Run locally

Requires Node.js 20 or newer. The app has no third-party runtime or build dependencies.

```sh
npm run dev
```

Open `http://127.0.0.1:4179`. Copy `.env.example` to `.env`, then add your Apify API token as `APIFY_TOKEN` to enable collection. Keep the token on the server and out of browser code and commits.

## What it does

- Manage Facebook group and page sources you choose.
- Run a configurable Apify Actor and review returned posts in a searchable queue.
- Save people with private notes, write local drafts, and open valid Facebook post links in context.
- Export or restore a local JSON backup from Settings.

Common Ground stores workspace data in the current browser's local storage. It does not automatically message, comment, like, post, or classify people as bots. Apify Actors vary in their source access and input/output formats; review the applicable access rules and each conversation yourself.

See [APP_README.md](APP_README.md) for setup details, Actor configuration, privacy notes, and limitations.
