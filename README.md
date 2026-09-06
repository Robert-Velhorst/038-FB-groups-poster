# FB Groups Poster

FB Groups Poster is a local-first, open-source Facebook publishing and campaign tool. It is designed to reach full functional parity with Post Partner and then extend that model with rule-aware campaigns, AI-assisted content, autonomous approved-source campaigns, stronger failure handling, auditability, and a clean upgrade path to an optional multi-user SaaS product.

The first release is a self-installed Chrome and Edge extension for one local user and one Facebook account. It uses the Facebook session in the user's own browser. No subscription, central account, or remote Facebook-password storage is required.

## Product goals

- Publish to supported Facebook profiles, Pages, managed groups, joined groups, and groups joined as a Page.
- Import, categorise, search, and manage posting destinations.
- Create, schedule, repeat, and audit campaigns.
- Support text, links, images, video, Marketplace reposting, RSS, and other approved sources.
- Offer manual, AI-assisted, and autonomous source-driven content modes.
- Enforce destination-specific group rules before general campaign rules.
- Prevent duplicate, uncertain, or unauthorised publishing.
- Keep Facebook execution local while allowing a future cloud control plane.
- Remain usable without a paid hosted service.

## Core decisions

- Initial distribution: open-source and self-installed.
- Future direction: optional multi-user SaaS upgrade.
- Final scope: Post Partner parity plus modern campaign, AI, safety, and analytics features.
- Delivery: a credible release 1 followed by modular feature activation.
- Content autonomy: three selectable modes per campaign.
- Architecture: local Campaign Core plus a narrow Facebook browser adapter.

## Platform constraint

Meta deprecated the Facebook Groups API and the publish_to_groups permission in Graph API v19.0, with removal effective 22 April 2024. General cloud publishing to arbitrary joined groups cannot therefore be the foundation of this product.

Until Meta offers a suitable official integration, group publishing must be executed on a user-controlled device through the user's existing authenticated Facebook browser session.

Official references:

- Meta Graph API v19.0 changelog: https://developers.facebook.com/docs/graph-api/changelog/version19.0/
- Meta Graph API v19.0 announcement: https://developers.facebook.com/blog/post/2024/01/23/introducing-facebook-graph-and-marketing-api-v19/

Platform capabilities and rules can change. Current official documentation, applicable terms, account permissions, and destination rules must be reviewed before production publishing is enabled.

## Product principles

- The user controls accounts, destinations, campaigns, limits, and factual claims.
- Destination-specific rules override collection and campaign settings.
- AI cannot publish without the authorisation required by the selected content mode.
- Every destination receives a separate, inspectable result.
- An uncertain send is never treated as successful or blindly retried.
- CAPTCHAs, warnings, access checks, and restrictions are not bypassed.
- Content variation must preserve meaning and must not be used to evade moderation or detection.
- Core local operation never requires a cloud subscription.
- The dashboard never overstates compatibility, publication, moderation, or engagement.
- The product never guarantees that an account will not be restricted.

## Scope

The complete product includes:

- Facebook identity and destination discovery;
- profile, Page, managed-group, joined-group, and group-as-Page publishing where supported;
- group collections and destination metadata;
- destination-rule management;
- post types, templates, variables, and Spintax;
- manual, AI-assisted, and autonomous campaigns;
- text, links, images, and video;
- Marketplace reposting;
- RSS, Atom, website, product, event, dataset, and briefing sources;
- local media library and media pools;
- scheduling, recurrence, pacing, and capacity controls;
- validation, submission, confirmation, moderation state, and recovery;
- history, analytics, export, import, backup, and deletion;
- optional cloud sync, teams, approvals, administration, and subscriptions.

## Non-goals

The product does not:

- send a user's Facebook password or session cookies to a remote application server;
- bypass CAPTCHAs, verification, warnings, membership controls, or rate limits;
- disguise automation to evade enforcement;
- guarantee protection from account restrictions;
- publish to unavailable or unauthorised destinations;
- treat group membership as blanket permission;
- create misleading Marketplace listings;
- fabricate facts, prices, availability, endorsements, or outcomes;
- use content variation as permission to spam;
- make a hosted account mandatory for local operation.

## 1. Architecture

### 1.1 Campaign Core

The platform-independent Campaign Core manages campaigns, versions, content modes, sources, templates, variables, post types, destinations, collections, rules, approvals, schedules, recurrence, limits, variants, validation, execution state, history, metrics, and audit events.

It contains no Facebook selectors, DOM traversal, or composer-specific behavior.

### 1.2 Facebook Browser Extension

The extension operates inside the user's authenticated Facebook browser environment. It:

- discovers supported identities and destinations;
- imports visible destination metadata;
- opens a certified composer;
- selects the approved posting identity;
- enters approved text and links;
- attaches approved media;
- submits only after all validations pass;
- verifies the observable Facebook result;
- stores a post link and moderation state when reliable;
- reports success, failure, uncertainty, or human action required;
- stops on unknown interfaces, CAPTCHAs, checks, and warnings.

The extension never exports Facebook passwords or session cookies to the application backend.

### 1.3 Local Scheduling Worker

The worker evaluates due tasks and prepares executions. Facebook actions require an active supported browser and extension.

When the device or browser is unavailable, the campaign explicitly chooses to:

- run later within a grace window;
- mark the task missed;
- require manual rescheduling.

A missed task is never shown as completed.

### 1.4 Local Data Store

Local storage contains settings, campaigns, destination records, collections, confirmed rules, templates, Spintax, source references, media metadata, schedules, approvals, execution keys, results, metrics, and audit records.

Export, import, encrypted backup where supported, migration, retention, and full deletion are required.

### 1.5 Optional SaaS Layer

A future cloud control plane may add users, organisations, roles, approval flows, encrypted synchronisation, central media, remote campaign management, reports, subscriptions, and multiple local execution agents.

The cloud remains separate from Facebook execution. Unless an official Meta API permits the action, final publishing remains on a user-controlled device.

## 2. Destinations and identities

Supported destinations include:

- personal profile where technically and contractually supported;
- managed Pages;
- managed groups;
- joined groups;
- groups joined as a managed Page.

Each destination records its identifier, URL, name, type, permitted identities, collections, availability, rule status, last confirmation, posting interval, recent attempts, moderation behavior, notes, and exclusions.

The user can select one destination, multiple destinations, saved collections, or rule-based sets. The resolved destination list is frozen per campaign execution for auditability.

## 3. Group collections

Collections organise destinations by region, topic, audience, project, language, content type, commercial permission, posting identity, campaign, frequency, moderation requirement, and custom tags.

A destination may belong to multiple collections. Destination-level rules and exclusions always take precedence.

## 4. Destination rules

Per destination, the tool can store:

- allowed topics;
- commercial-content policy;
- link policy;
- image and video policy;
- Marketplace policy;
- required labels, hashtags, prefixes, or format;
- permitted identities;
- allowed days and times;
- minimum interval;
- moderation expectations;
- prohibited calls to action;
- free-form notes;
- source and last-confirmed date.

AI may summarise visible rules, but a user must confirm them before autonomous publishing. Missing, stale, contradictory, or uncertain rules limit the destination to Manual mode or per-post approval. Unavailable rules never imply unrestricted permission.

## 5. Post types

Built-in types include informational, engagement, question, event, job or volunteer opportunity, product or service, Marketplace listing, update, news, evergreen repeat, and custom.

Campaigns can rotate types while respecting destination rules.

## 6. Content modes

### 6.1 Manual

The user controls exact text, links, media, destinations, schedule, recurrence, and Spintax. AI changes nothing unless the user separately requests and approves a draft.

### 6.2 AI-assisted

The user supplies or approves a base message, objective, audience, tone, language, facts, prohibited claims, call to action, allowed variation, length, and media.

AI creates destination-aware variants. The user approves the campaign, representative outputs, factual boundaries, and variation policy before activation. Validation prevents semantic or factual drift.

### 6.3 Autonomous approved-source

The system selects suitable source items, creates validated content, chooses eligible destinations, and schedules posts inside an approved campaign.

Approved sources may include RSS or Atom feeds, the user's website, product catalogue, event calendar, connected dataset, the user's Marketplace listings, an approved briefing, and the local media library.

Every autonomous campaign defines allowed sources, fields, claims, destinations, limits, recurrence, expiry, and approval policy. The mode never grants unrestricted authority to invent topics or promises.

## 7. Content and variation

A post may contain supported text, links, images, video, alt text where exposed, template fields, Spintax, campaign variables, and approved media-pool selections.

Variation methods include templates, simple and nested Spintax, variable substitution, approved alternative introductions and calls to action, media pools, AI rewrites, and language variants.

All variants preserve approved facts, price, availability, legal claims, identity, and intent. Variation cannot be used to avoid duplicate-content controls or moderation.

Before execution, validation checks:

- unsupported factual claims;
- prohibited language;
- missing disclosures;
- destination-rule conflicts;
- semantic drift;
- stale dates, prices, or availability;
- duplicate or excessively similar recent content;
- broken links or missing media.

The final rendered content is frozen and retained per destination.

## 8. Marketplace reposting

For the user's own Marketplace listings, the tool can import supported listing metadata, map listings to collections, reuse title, price, location, description, and images, add group-specific introductions, schedule recurrence and expiry, and stop when a listing becomes inactive, sold, removed, or expired.

The tool never duplicates third-party listings or invents misleading offers.

## 9. RSS and other sources

Source ingestion supports polling intervals, stable item identifiers, content hashes, duplicate detection, timestamps, eligibility, freshness windows, expiry, exclusions, error state, and source-specific templates.

Unchanged items are not republished unless recurrence is explicitly approved. Removed or expired items stop future executions.

## 10. Scheduling and recurrence

Scheduling supports:

- immediate publishing;
- one-time date and time;
- daily, weekly, monthly, and custom intervals;
- multiple fixed dates;
- campaign windows;
- daily and weekly limits;
- destination minimum intervals;
- repeat every configured number of days;
- end date and maximum count;
- quiet periods;
- missed-task policy;
- pause, resume, and destination suppression.

Schedules use IANA time zones. Daylight-saving changes, browser downtime, restarts, and clock drift must not create duplicate posts.

## 11. Media library

The local media library supports images, certified video, thumbnails, tags, collections, alt text, dimensions, duration, file size, compatibility checks, usage history, approved random pools, and missing-file detection.

Media remains local by default. Future cloud synchronisation is optional, encrypted, and separate from Facebook session data.

## 12. Safety Controller

Before every destination execution, the Safety Controller verifies:

- authenticated-session health;
- selected identity availability;
- destination access;
- rule confirmation;
- content, link, and media permission;
- destination interval;
- daily, weekly, campaign, and capacity limits;
- recent content similarity;
- prior uncertain or failed state;
- composer compatibility;
- outstanding warnings or restrictions.

Limits exist for responsible control and reliability, not for simulating human behavior or evading detection.

## 13. Stop and pause conditions

Publishing stops when:

- a CAPTCHA appears;
- Facebook requests verification;
- the session expires or changes unexpectedly;
- Facebook shows a warning or restriction;
- the composer is unknown;
- a possible duplicate exists;
- a previous send is uncertain;
- required media is missing;
- required destination rules are stale or uncertain;
- content validation fails;
- a configured limit is exhausted;
- technical failures repeat;
- the selected identity lacks access;
- adapter integrity or compatibility fails.

The tool explains the cause. It does not click through warnings, solve or outsource CAPTCHAs, rotate identities, or bypass restrictions.

## 14. Reliable execution

Every campaign-post-variant-destination combination has a stable idempotency key.

Execution states are Scheduled, Validated, Ready, Started, Published, Pending group approval, Rejected, Failed, Uncertain, Skipped, Paused, and Human action required.

A task becomes Published only after observable confirmation. An Uncertain task is quarantined and reconciled against Facebook state before any retry. Blind automatic retry is prohibited.

## 15. Results and analytics

Per destination, the system retains intended time, attempt time, rendered content, posting identity, adapter version, validation record, result state, confirmation, direct URL where reliable, moderation state, failure reason, and reconciliation decision.

Analytics include:

- scheduled and attempted posts;
- confirmed publication rate;
- failed, uncertain, rejected, and moderated counts;
- outcomes by campaign, destination, collection, post type, and mode;
- destinations with repeated failure or rejection;
- content reuse;
- visible interaction counts where reliable and permitted;
- estimated time saved.

Measured data and estimates are labelled separately. Leads, sales, and conversions are not claimed without verifiable linked data.

## 16. Dashboard

The dashboard provides calendar and list views, campaign states, upcoming tasks, destinations, collections, rule status, content, templates, media, drafts, approvals, results, session and adapter health, limit usage, analytics, errors, remediation, and a global stop.

Every execution explains what happened, which content and rules were used, and whether retry is safe.

## 17. Privacy

The open-source edition is local-first.

Requirements:

- no Facebook-password storage;
- no remote transmission of Facebook session cookies;
- local campaigns, destinations, media, rules, and history by default;
- local AI or a user-selected provider;
- minimum necessary disclosure to external AI;
- encrypted provider keys and secrets;
- no session tokens in logs;
- export, import, backup, retention, and deletion;
- telemetry disabled by default;
- disclosure of every optional network service.

A future SaaS edition requires separate consent and a strict boundary between local execution and optional cloud data.

## 18. Security

Security controls include:

- Manifest V3-compatible least-privilege permissions;
- separated extension components;
- authenticated messages between components and any local worker;
- allowlisted origins;
- protection against forged execution commands;
- encrypted secrets;
- signed releases and adapter updates;
- dependency and supply-chain scanning;
- content sanitisation;
- prompt-injection resistance for pages, groups, feeds, and imported content;
- redacted diagnostics;
- no arbitrary remote code execution;
- secure migration and rollback;
- auditable configuration changes.

## 19. Compatibility and updates

The Facebook adapter is versioned independently from the Campaign Core. It requires compatibility checks before writes, tests for supported layouts and languages, explicit unsupported states, signed releases, rollback, and automatic-publishing disablement when compatibility is unproven.

Self-healing is limited to known and tested interface variations. Unknown states require human review.

## 20. Minimum Credible Product

Release 1 includes:

- open-source Chrome and Edge extension;
- one local user and one Facebook account;
- import of available profile, Pages, and groups;
- destination collections;
- manually confirmed destination rules;
- supported group posting as person or Page;
- text, links, and images;
- Manual mode;
- AI-assisted mode;
- templates and Spintax;
- one-time scheduling and fixed recurrence;
- configurable intervals and limits;
- local calendar;
- idempotent execution and deduplication;
- separate confirmation per destination;
- pause on interface, session, account, rule, or content problems;
- local history, export, import, backup, and deletion;
- basic analytics;
- no required cloud account or subscription.

Release 1 contains stable extension points for video, media pools, Marketplace, RSS, Autonomous mode, advanced analytics, multiple accounts, synchronisation, and SaaS.

## 21. Release 1 acceptance criteria

Release 1 is accepted only when:

1. Available groups, Pages, and identities import correctly on every certified layout.
2. Only explicitly selected destinations can be used.
3. Destination rules can block collection and campaign settings.
4. Text, links, and images publish correctly through each supported composer.
5. AI content cannot publish without mode-appropriate authorisation.
6. Spintax and AI variants preserve approved facts and intent.
7. Daily, weekly, campaign, and destination limits cannot be exceeded.
8. Restart, crash, or network error cannot execute a task twice.
9. An uncertain send is quarantined and not automatically retried.
10. CAPTCHAs, warnings, expired sessions, checks, and unknown interfaces stop affected publishing.
11. Every destination has an independent, inspectable result.
12. The user can stop all automation immediately.
13. Local data can be exported, restored, retained, and deleted.
14. Facebook passwords and session cookies are not sent to an application server.
15. The product states that users must comply with Meta terms and destination rules.
16. Adapter updates enable automatic publishing only after compatibility tests pass.

## 22. Full product roadmap

After release 1:

1. video publishing;
2. full media library and approved media pools;
3. Marketplace reposting;
4. RSS, Atom, website, product, event, and dataset sources;
5. Autonomous approved-source mode;
6. advanced rule assistance;
7. expanded analytics;
8. multiple local Facebook accounts;
9. optional encrypted synchronisation;
10. team, organisation, approval, administration, and SaaS capabilities.

Full Post Partner parity plus the approved modern extensions remains the required end state.

## 23. Data model

Core entities include UserSettings, FacebookExecutionProfile, PostingIdentity, Destination, DestinationCollection, DestinationRule, RuleConfirmation, PostType, ContentSource, SourceItem, Template, SpintaxDefinition, MediaAsset, MediaPool, Campaign, CampaignVersion, CampaignApproval, ScheduledExecution, RenderedVariant, ValidationResult, ExecutionAttempt, PublicationResult, ModerationState, MetricObservation, AdapterVersion, AuditEvent, and BackupManifest.

## 24. Testing strategy

Testing includes:

- Campaign Core unit tests;
- property-based schedule, limit, recurrence, and idempotency tests;
- rule-precedence tests;
- Spintax rendering tests;
- factual-preservation and semantic-drift tests;
- prompt-injection tests for imported content;
- policy and claim validation;
- adapter contract tests against permission-compliant fixtures;
- authorised end-to-end tests where permitted;
- person, Page, group, and group-as-Page composer tests;
- text, link, image, and later video tests;
- session expiry, CAPTCHA, warning, check, and unknown-layout simulations;
- uncertain-send reconciliation;
- restart and offline tests;
- export, import, backup, migration, retention, and deletion tests;
- extension-permission and local-messaging security review;
- SaaS-boundary tests when cloud components exist.

Tests must not post to real third-party groups without prior permission.

## 25. Delivery phases

1. Define core data and execution-state models.
2. Build local storage, migration, export, import, backup, and audit.
3. Implement read-only Facebook identity and destination discovery.
4. Add Manual mode, templates, selection, rules, and validation.
5. Add confirmed text, link, and image publishing.
6. Add idempotent scheduling, limits, recurrence, pause, and reconciliation.
7. Add Spintax and AI-assisted mode with factual-preservation checks.
8. Build dashboard, calendar, history, and basic analytics.
9. Complete compatibility, privacy, recovery, and security testing for release 1.
10. Add roadmap modules without weakening the local-first core.

## 26. Definition of done

A release is complete only when:

- all acceptance criteria for its declared scope pass;
- supported Facebook layouts and languages are documented;
- destination results are independently auditable;
- rule precedence is deterministic;
- uncertainty cannot trigger a blind retry;
- automation stops on account, interface, and policy problems;
- export, restore, retention, and deletion work end to end;
- extension permissions are justified and minimal;
- current platform dependencies and limitations are documented;
- the dashboard does not overstate success or compatibility.

## Legal and ethical responsibility

Users must comply with current Meta terms, applicable law, intellectual-property rights, privacy obligations, advertising rules, and every destination's rules. Membership in a group does not itself grant permission to publish any type of content.

If intended automation is prohibited by applicable Meta or destination rules, production publishing must remain disabled unless explicit permission is obtained. The project must not be marketed as affiliated with, endorsed by, or sponsored by Meta or Facebook.

Facebook is a trademark of Meta Platforms, Inc. Post Partner is a third-party reference product and is not affiliated with this project.

## Licence

No licence has been selected. Until a licence file is added, no permission is granted to copy, modify, or distribute the source code.