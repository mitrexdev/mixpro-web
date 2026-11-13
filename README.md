# Mixpro public website — guest viewing

Separate Next.js + TypeScript visitor website using the admin's Inter font, light palette, pill buttons and catalog. Public viewer authentication is currently removed at the owner's request. Anyone can browse and watch published, ready episodes without creating an account.

## Location and running

The requested sibling Desktop directory was read-only in this execution environment. This project is in `/home/mitrex/Desktop/mixpro/mixpro-web` and can be moved into a standalone folder later. The local node_modules symlink reuses the admin dependencies for validation; replace it with a normal `npm install` when moving the project.

`npm run dev` starts on 127.0.0.1:3001. Use `npm run typecheck`, `npm test` and `npm run build` for checks. The build uses Webpack. Server settings belong in ignored `.env.local`; `.env.example` lists them. SITE_URL must exactly match the browser origin, including an HTTPS tunnel origin when applicable.

## Public experience

- Cinematic featured-series carousel with five-second automatic rotation, manual controls, pause/resume, real artwork and animated transitions. Rotation pauses on hover, keyboard focus and hidden tabs; reduced-motion preferences disable it.
- Swipeable poster shelves, recently added and conditional rating/genre collections.
- Refined cards, browse filters and series/episode surfaces, with keyboard focus and reduced-motion support.
- Explore page with editorial masthead, real poster stack, genre tabs, a compact popup-search trigger, sort controls and four-column poster gallery. Cards reveal summaries on hover/focus; touch screens show descriptions below titles.
- Poster-led series introduction with title, rating, synopsis, watch/trailer actions and credits; season buttons show published episode counts and episodes use thumbnail rows.
- Watch player with the original side-by-side season queue, previous/next navigation, refined episode synopsis/reactions/comments, and a bottom recommendation shelf. Current episode highlighting, language controls and resume behavior are preserved. Recommendations exclude the current series and prioritize matching genres among published catalog entries.
- Editorial About/credits page and shared recovery/maintenance screens.
- Route-specific loading skeletons for Explore, series, watch and About.
- Season selection, episode list, trailers and credits.
- Watch page with next-episode navigation and no sign-in gate.
- About/credits, maintenance mode, skeleton/error/empty states and mobile layouts.
- TVmaze source attribution where a series has a source URL.

Only published series and episodes are public. An episode under an unpublished parent cannot bypass the catalog checks. API credentials and Mux asset IDs remain server-side. No fabricated series or view counts are seeded.

## Popup search

Header search and Explore search buttons open a native modal dialog. Ctrl+K / Command+K toggles it; Escape and backdrop clicks close it. Search is debounced, cancels old requests, and displays up to eight results from the published catalog. Arrow keys navigate results; Enter opens a focused result or submits a full Explore search. The dialog has focus containment, focus restoration, loading/empty/error states and reduced-motion support. `/api/search` respects maintenance and returns only public display fields. Server credentials remain server-side.

## Authentication removed

There are no public login/signup buttons, forms, account screen, session lookup or email requirements. Legacy /login, /signup and /account links redirect to browse or a valid selected watch/series path. Previous signup/resend endpoints return HTTP 410 instead of creating accounts or sending messages; /api/session reports guest mode. The old callback redirects to browse without exchanging credentials. Logout only clears obsolete viewer cookies.

Existing Supabase users are not deleted and admin authentication/roles remain intact. User block controls no longer restrict public guest viewing; there is no viewer identity to authorize. Google/SMTP setup is unnecessary for the current public site.

## Mux playback

Existing ready public Mux assets play without signing credentials. Signed assets still require MUX_SIGNING_KEY_ID and MUX_SIGNING_PRIVATE_KEY on the server; the server issues short-lived tokens for published videos to any visitor. These tokens do not impose account-based access in guest mode. The site does not change Mux asset policies in response to visitor requests.

The optional `scripts/secure-playback.mjs` utility can create signing keys and convert legacy public assets to signed IDs, intentionally invalidating old public links. It is not required to view existing public assets. Its previous execution failed because the Mux API could not be reached; signing setup remains pending for assets that already require it. New admin uploads use signed playback; configure the keys for those videos. Admin previews support signed tokens as well.

## Analytics

Real play events create records in the shared playback_events table with viewer_id=null and an anonymous visitor_id, stored in an HttpOnly, SameSite=Lax cookie. Watch-time updates are limited to that visitor's event and elapsed time. Admin totals therefore continue to count guest views and watched seconds. These are application metrics, not fraud-resistant billing measurements. Migration `20261113000700_guest_playback.sql` was applied through the Supabase CLI. Existing account/viewing records are preserved.

## Ads and verification

Monetag uses the owner-provided Vignette tag configured in lib/ads.ts.

TypeScript and production build checks are available. Ten isolated tests cover published/draft filtering, unpublished-parent bypass, guest playback, maintenance, signed-token helper behavior and disabled auth endpoints. External services are mocked; live playback and browser rendering remain unverified in this restricted environment.

## Managed homepage spotlight

The admin Homepage posters section controls hero artwork, heading, description, linked series, order and visibility through the shared homepage_posters table. Only enabled posters linked to published series are rendered. No configuration retains automatic latest-series selection; all-hidden configurations stay empty. Migration 20261113000800_homepage_posters.sql has been applied. Browser and live image-upload verification remain unavailable in the restricted environment; a direct HTTP database read also failed due to network access, although the CLI migration succeeded.

## Responsive artwork

ImageKit delivery URLs now request responsive size variants. Homepage/series banners use 16:9 padding to preserve the full image; mobile banner copy sits below the image. Portrait cards use 2:3 crops, episode artwork uses 16:9 crops, and search/queue thumbnails request smaller files. Native width/height attributes reserve image space. Admin poster previews use the same banner framing. Only unsigned HTTPS ik.imagekit.io URLs are transformed; other providers and local blob previews remain unchanged. Originals stored in the database are preserved.

## Episode reactions and comments

Watch pages have like/dislike toggles, share/copy-link, and paginated guest comments. A separate HttpOnly SameSite guest cookie identifies one reaction per episode and owns comments; this is browser identity, not an authenticated account. Clearing that cookie removes the ability to delete previous guest comments. Display names and comment text are public; visitor UUIDs are never returned. Comments are plain text, limited to 2,000 characters, and the database RPC enforces a 15-second delay between comments by the same guest. Own-comment deletion requires confirmation.

Migration `20261113000900_episode_community.sql` was applied using the Supabase CLI. Tables use RLS and deny direct anon/authenticated access. The server API enforces trusted origins on mutations and only exposes published episodes under published parent series, outside maintenance mode. Existing guest playback is preserved. Tests cover ownership, public projections, reaction uniqueness, validation, throttling and publication guards. Browser/live end-to-end interaction remains unverified in this environment.

## Audio languages

The public player and admin preview expose an Audio language selector when Mux Player's actual audioTracks list contains at least two entries. Track add/remove/change and media-load events update it; selection changes enabled tracks without changing the episode or resetting the source. The native in-player multi-audio controls remain available.

Admin video preview includes Audio languages inspection and an alternate-track form accepting a direct HTTPS audio-file URL, BCP-47 language code and track name. The server requires content permission, trusted mutation origin and a ready video asset before calling the Mux SDK createTrack method. Alternate audio must be synchronized with the video and finish processing before playback can expose it.

Existing asset contents were not confirmed: no Mux MCP tools were connected and `mux assets list` failed with a connection error. Official Mux multi-track docs and installed SDK/player types were used instead. A source file having multiple audio streams does not verify that those streams are present in the delivered HLS manifest. No existing asset was modified automatically and no languages are fabricated in the player. Live switching remains unverified.

## Continue watching

Playback position is saved in versioned browser-local storage every five seconds while playing and on pause, seek, tab hide and navigation. Returning to the episode restores the saved time without autoplay. After five seconds of progress, unfinished episodes appear in the homepage Continue watching rail with thumbnails, a progress bar, time left and a remove control. Completed/near-completed episodes are removed; records expire after 90 days and the latest 24 episodes are retained. Storage failures do not block playback.

This currently works within the same browser/device, because public accounts are disabled. It does not sync across devices. Homepage metadata is fetched with published-episode, published-parent and ready-video filters, so unavailable entries are not displayed and no playback credentials are exposed. Local playback position is separate from analytics watched-seconds. Browser resume has not been verified live in this restricted environment.

## Theme

Navbar includes a light/dark icon toggle instead of Start exploring. Theme preference is saved as mixpro.theme in local storage. First visits follow the system preference, including later system changes until an explicit theme is chosen; changes sync across tabs. A small head script applies the theme before content paint. Theme tokens and surface treatments cover navigation, catalog, search dialogs, episode lists, reactions and forms.

## Footer

The shared footer uses a responsive brand-and-links layout with real collection filters, About/credits, configured support email, copyright and a back-to-top anchor. Its colors follow the selected theme. No placeholder social or legal links are added.

## Explore pagination

Explore shows eight filtered/sorted series per page. Pagination appears above eight results and includes bounded page numbers, previous/next links, current-page state and visible result ranges. Links preserve search, genre and sort; changing filters starts at page one. Invalid pages default to one and out-of-range pages clamp to the final page.

## Shelf navigation

Poster shelves hide the native horizontal scrollbar and use compact Previous/Next controls, edge fades and native swipe/trackpad scrolling. Arrow buttons advance by a visible group of cards; focused rails support Left/Right and Home/End. Controls disappear when all cards fit and respect reduced motion.

## Viewer title requests

Public navbar contains Explore, About and Request. The request dialog collects a display name, searches TVmaze titles, or accepts a manual title for movies/items not in TVmaze's TV catalog. TVmaze selections are verified again on the server before persistence; client title/artwork values are not trusted. A separate HttpOnly guest cookie enables a database-enforced 60-second submission interval and blocks duplicate pending requests from that guest.

Migration `20261113001000_content_requests.sql` was applied with Supabase CLI. Request rows are RLS-protected and unavailable to anon/authenticated database roles. Admin content roles receive a bell unread count and a Requests inbox with pagination, mark-read and reviewed/fulfilled/declined statuses. The count and open inbox refresh every 30 seconds while visible and on window focus. This is in-app notification polling, not browser push/email.

Search requires no TVmaze API key. TVmaze/network failures expose manual entry. Server tests cover origin checks, canonical TVmaze data, validation, duplicate/cooldown responses and admin permissions. Browser/live TVmaze search and submission were not verified in this restricted environment.

## Site motion

Public routes use a short page-entry fade. Offscreen discovery, episode, community and footer groups reveal once on intersection, with no scroll-event polling. Buttons, fields, theme icons, confirmation states and dialogs have coordinated short transitions. Initial content remains visible without JavaScript; reduced-motion changes clear pending reveals and disable animation. Focused and printed content is never hidden. Playback remains outside the scroll-reveal groups.

## Public advertising

Monetag is configured in the public repository's lib/ads.ts with the owner's Vignette zone 12250721 and exact https://n6wxm.com/vignette.min.js tag. Admin has no advertising controls or ad settings endpoint. The historical site_ads table is retained for migration compatibility and is no longer read for ad delivery.

Ads run once per document on slidra.in/www.slidra.in, on Home, Explore and series pages. Watch and other routes remain excluded. Localhost and Vercel preview hosts do not load ads. Leaving an advertising page for an excluded route creates a fresh document. Provider delivery depends on its frequency limits, available inventory and browser settings; a successful script load does not guarantee an impression.

Push Notifications zone 12250716 also loads using the owner-provided https://nap5k.com/tag.min.js tag. Its official worker is served at /sw.js (3nbf4.com, supplied by Monetag MCP). Push requires the visitor to opt in to browser notifications; it is not an In-Page Push banner. The previous unused Push worker for zone 12250715 has been replaced. Both tags share the same production-host and discovery-page scope.

OnClick/Popunder zone 12091078 uses the owner-provided https://al5sm.com/tag.min.js tag on the same discovery pages. It can open an advertiser tab on a visitor click; it is not an In-Page Push banner.
