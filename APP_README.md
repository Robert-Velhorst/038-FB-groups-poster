# Common Ground

Common Ground is a local-first workspace for finding relevant conversations in Facebook communities, reviewing them in context, and choosing how to connect in your own voice.

## Start

Requires Node.js 20 or newer. No third-party runtime or build dependencies are needed.

```sh
npm run dev
```

Open `http://127.0.0.1:4179` for the public landing page. Choose **Explore the workspace** or open `/app.html` directly for the app.

Set `APIFY_TOKEN` in a local `.env` file to enable Apify. Keep the token on the server; never put it in browser code or commit `.env`. Without a token, the sample workspace remains usable.

## Apify

In the app, open **Apify**, enter an Actor ID, and adjust the JSON input to match that Actor. The selected Facebook source URLs are supplied through `startUrls`; the Actor must support that input field. Results are read from the Actor's default dataset and normalized into the conversation queue. Runs that take longer than a minute are checked until they finish. Duplicate post URLs are skipped.

Actors differ in source coverage, input fields, output fields, cost, and access requirements. Common Ground does not log in to Facebook or bypass access controls. An Actor can only return what it can access; group membership by itself is not permission to defeat technical restrictions. Confirm the applicable platform rules, law, and group expectations before collecting. Every imported item still needs a human to check the original thread.

## What the workspace can do

- Search and filter a review queue of sample and collected conversations.
- Review a post, dismiss it, save a person with a private note, or mark that you joined the conversation.
- Save Facebook group/page URLs, choose which sources to pass to an Actor, and pause or remove sources.
- Write and keep private response drafts, then copy them when you choose.
- Export a JSON backup, restore one, or reset the browser workspace to the examples from **Settings**.
- Use a responsive landing page to introduce the product and link people to the workspace.

## Data and boundaries

The app has no account or shared database. Groups, imported posts, saved people, drafts, and Actor settings are stored in browser local storage. Anyone who can access that browser profile may be able to see the data. Backups can include source URLs and personal notes; store them carefully.

Nothing is automatically posted, commented, liked, messaged, or scheduled. Common Ground does not claim to detect bots or verify that a person is authentic. Facebook actions stay in Facebook and remain your choice. The local server binds to `127.0.0.1`; this repository does not include a hosted deployment, multi-user isolation, or a persistent server database.

All built-in conversations and communities are illustrative samples. Do not treat them as real Facebook posts or people.
