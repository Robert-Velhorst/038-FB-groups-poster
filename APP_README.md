# Common Ground

An original, local-first Facebook community listening workspace inspired by the group-management workflow in PostPartner and shaped by Robert's earlier Facebook-group tool notes.

## What is here

- A responsive dashboard and conversation review queue with clearly marked sample records.
- Search and intent filters; review actions to dismiss a post, save a person locally, or mark that you joined the discussion.
- Group/source list with explicit URL entry, categories, and paused-by-default collection.
- Apify Actor runner using a server-only `APIFY_TOKEN`; collection results are imported into the review queue.
- A local draft pad for writing in your own voice.
- No auto-messaging, auto-commenting, auto-liking, or automatic Facebook publishing.

## Run locally

Requires Node.js 20 or newer. The app has no third-party runtime or build dependencies.

```sh
npm run dev
```

The local server runs at `http://127.0.0.1:4179`. Set `APIFY_TOKEN` in a local `.env` file before starting the server to enable Apify. The token must never be added to the frontend or committed.

`npm start` runs the same server for local production-like use.

## Apify connection

The app sends the chosen Actor ID and selected source URLs to `/api/apify/run`. The server calls Apify's `run-sync-get-dataset-items` endpoint and returns up to 100 output items. Actors differ in their input schema and output field names; this starter maps common post text, URL, author, group, and comment-count fields. Adapt the input and mapper for the specific Actor you select.

Apify Actors can only return what they are able and permitted to access. The Facebook Posts Scraper is intended for public page/profile content; it does not imply access to private group posts. Use an Actor only when the source, method, and intended processing comply with the applicable platform terms, privacy law, and group expectations. A group membership alone is not permission to defeat technical access controls.

## Data and limits

Sample conversations are fictional and illustrative. User actions, drafts, groups, and the Actor ID are stored in the current browser's local storage. The app has no login, shared database, retention controls, export/import screen, or multi-user isolation yet. Do not use it for sensitive personal data in this starter form.

This release is a functional review-first workspace, not a posting clone. Facebook group publishing is intentionally outside this implementation; Meta removed the general publish-to-groups API, and a user-controlled browser workflow would require a separate, carefully reviewed browser-extension implementation.
