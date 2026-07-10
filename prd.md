PRODUCT REQUIREMENTS DOCUMENT · REWRITE · JULY 2026
# Confessional Christianity — Catechizing Your Child

A full restatement of the product. This supersedes the prior PRD in whole: the app is no longer a reading/reference tool that happens to add structured plans, but a tool for catechizing children whose reference library exists to serve that purpose.

## 1. What This App Is For

Confessional Christianity exists to help a parent catechize their child — to teach them a historic catechism, question by question, at a sustainable pace, rooted in the scripture underneath each answer, and supported with the material a parent actually needs in the moment: what to say about it, what to read further, what to point to in the world, and what to pray. Everything else the app does — the confession and catechism library, the reflection essays, search — exists in support of that purpose, not alongside it as an equal concern.

This is a deliberate narrowing from earlier drafts of this document, which treated the app as a general reading/reference product with programs as one feature among several. That framing is retired. The product's reason to exist is the catechizing use case; a Bible-in-a-year plan or a topical devotional path are secondary extensions of the same mechanism, not co-equal pillars.

Longer-term context (not in scope for this phase): the eventual goal is an iOS app for a broad evangelical audience without a reformed background — a "Hallow, but for Protestants," built around this same catechizing core. That future app is, in substance, an attempt to catechize these evangelicals without ever calling it that. That app is deferred until the web app itself proves the model (§14). Priority right now is the catechizing experience: authoring a plan, running a session with a child, and giving the parent what they need to teach well.

## 2. The Problem

A parent who wants to catechize a child today has a text (the catechism itself) and not much else. What's missing is everything around the text: a sane pace (how many new questions per sitting, how much to rehearse what's already learned, when a question is actually "done" and it's time to move on); the scripture the question is built on, taught as scripture in its own right and not just a citation to look up later; and material to make the question land for a child — a prayer that ties the question, the verse, and the child's life together, with deeper devotional material to follow as the product matures.

A secondary, longstanding problem carries over from earlier drafts: when reference content (a confession entry, a reflection essay) is read outside a program — via search, browsing the library, or a direct link — it should still read as a clean, considered page, not as leftover search-result chrome. This remains true, and is in fact the site's primary organic entry point; see §7.

## 3. Positioning & Principles

- Catechizing a child is the product, not a feature of it. A program (§5) is the primary object; everything else is reference material a program draws from.
- A session (§5.2) exists to serve exactly three things — memorization, reflection, and in-person reference — and nothing else. It is not a quiz app, a checklist, or a progress dashboard.
- Scripture is taught, not cited. Every catechism question a program covers carries its underlying scripture as real teaching material, not a bare reference to look up separately.
- The parent is equipped, not just the child tracked. Progress tracking is the trivial part; the harder and more important part is arming the parent with what to say and pray, and — as the product matures — what to read and point to (§5.3).
- Pacing belongs to the household, not the app. New questions per sitting, review depth, and what counts as "mastered" are all adjustable, never a fixed universal drill schedule.
- Whitespace is editorial, not empty — carried over from the app's reading identity into the session screen itself: one held thought per screen, never a stacked utility panel.
- The source text is never buried — a program's session always sits one tap from the full teaching notes (where they exist), and from the confession's own canonical entry.
- **Programs are the product; library pages are the front door.** These are not in tension. A stranger arrives via search at a canonical library entry (§6, §7) — that page is fully invested in as an SEO surface. A returning parent's *product* experience is the program. Search-as-entrance and program-as-product are two different funnel stages, not competing priorities.

## 4. Information Architecture

- `/` — homepage: a reader's active program continued above the fold, first paint; Programs browsable directly below; reflections and library further down, in support
- `/programs` — browse all programs (catechizing plans, reading plans, devotional paths)
- `/programs/[slug]` — a program's landing page: description, pacing summary, contents, progress, continue/start
- `/programs/[slug]/session` — today's session: new material, review, scripture & prayer (§5.2)
- `/programs/[slug]/[entry]/notes` — full teaching notes for one entry within the program, where they exist (§5.3)
- `/programs/[slug]/pacing` — the household's pacing controls for this program (§5.4)
- `/reflections` — essay index; supporting material, not a front door
- `/reflections/[slug]` — a single essay
- `/authors/[slug]` — author page
- `/library` — index of all confessions/catechisms, the reference layer programs are built from, and the site's primary organic entry point (§6, §7)
- `/library/[confession]` — document table of contents
- `/library/[confession]/[entry]` — one entry, canonical, reachable independent of any program
- `/search` — full search, reachable everywhere via a nav icon, never the entrance

Primary nav: wordmark, Programs first among small-caps text links (Programs · Reflections · Library), search icon. No per-child switcher lives in the nav (§5.5) — which child a program is for is shown on the program itself.

## 5. Programs: The Core of the Product

**5.1 What a program is.** An authored, ordered plan combining any mix of confession/catechism text, scripture, and original devotional writing. The flagship instance, and the reason this feature exists, is a family catechesis plan: a parent's paced walk through a catechism with a child. The same mechanism extends to a sequential scripture plan (Bible in a year) or a topical devotional path, but those are downstream applications of the catechizing model, not separate concepts designed in parallel.

**The first program** is an age-configurable traversal of the Westminster Shorter Catechism: for each question, the answer, its own proof-text scripture citations pulled directly from the catechism's own referenced texts, and an original prayer tying the question, its scripture, and the child's life together. No devotional note, no book recommendations, no illustration or object lesson — those belong to §5.3's teaching notes, which are explicitly deferred for this first program and layered in later, either as a v2 of this program or as a separate, richer program. Prayers are written progressively rather than all 107 up front; §5.4's pacing controls mean a household moving at a sustainable pace won't outrun a partially-populated program for weeks. Which questions have a prayer written is tracked and visible to the household so pacing can account for it.

**5.2 The session — design ethos.** Every program produces a "session," the unit of real-time use, typically a parent sitting with a child. A session exists to serve three things at once, and nothing else: memorization (rehearsing what's already been learned), reflection (sitting with new material rather than rushing past it), and reference (something to point to mid-conversation). It is not a quiz app, a checklist, or a gamified dashboard. Concretely: one held thought per screen, never a stacked list of sections competing for attention; generous, centered whitespace consistent with the rest of the app's reading identity; a quiet dot-and-arrow progression — new material, then review, then scripture & prayer, then done — so a session never requires scrolling and never asks the parent to hold more than one thing in mind at a time; deeper material lives one tap away (§5.3), where it exists, never inline.

**5.3 Teaching notes (deferred beyond the first program).** Eventually, a catechism question (or scripture passage, or devotional theme) a program covers can carry an enrichment page behind it, written for the parent, not the child: the underlying scripture in full, a short original devotional note on teaching this specific question, book and reading recommendations, an illustration or object lesson drawn from the everyday or from nature, and a prayer that weaves the question, its scripture, and the child's life together. This material may be original writing or attributed/licensed material from others in the tradition (e.g. Chad Van Dixhoorn's commentary on the Shorter Catechism). This is where the "equip the parent" principle (§3) fully lives, but it is explicitly not required for the first program to ship (§5.1).

**5.4 Configuration.** A program's shape is a set of household-adjustable controls, not a fixed schedule the app imposes: new questions introduced per session; how much previously-learned material is reviewed each time (a fixed recent window, a full rotation, or only what's still shaky); what counts as "mastered" (recited unprompted across several sessions running, a parent's own manual judgment, or a fixed number of exposures); how many sessions per week; and whether the underlying scripture is surfaced every time or only on introduction. Defaults are sane for a first-time user; nothing is locked. (Called "pacing" in the mockups; reframed here as configuration because it governs more than tempo — it's the household's whole set of choices about how the program runs.)

**5.5 A program belongs to a child.** Which child a program is for is a central concern, not a setting tucked into the nav. Every program a parent is running is explicitly associated with one child at a time, and that association is visible everywhere the program appears — its card, its landing page, its session — as plainly as "Eli's plan" rather than inferred from a quiet, separate profile switcher. A parent with several children sees their programs grouped or labeled by child on `/programs` and on the homepage (§8), and starting a new program means choosing which child it's for as part of starting it, not before or after via a dropdown. (The prior draft's "TRACKING: [CHILD]" nav control is retired; it hid the one piece of context that matters most.)

**5.6 Marking progress.** A single small heart glyph marks a question as recited/mastered, used identically in the session, the program's table of contents, and a lightweight overview of everything a profile has marked. Outline = not yet; a muted tone = in rotation/reviewing; filled ochre (the app's one departure from monochrome, scoped to this use) = mastered. This absorbs what the prior draft called "Memorization" as a standalone feature — it is now simply how a program tracks itself, not a separate page or product concern.

**5.7 Completing a program.** Finishing every question in a program is a real, acknowledged state — not a silent drop-off into an empty screen. A completed program shows a simple completion state with two paths forward: restart the same program (full rehearsal from question one), or start another available program for the same child (e.g. a second catechism, once more than one exists). Completion does not delete or hide progress history.

## 6. Reference Content: Reading an Entry or Essay Outside a Program

A program pulls from a library of confession/catechism entries and, where they exist, reflection essays written on them. These remain reachable on their own — via search, via browsing the library directly, via a direct link — independent of any program, and must read as clean, complete, canonical pages regardless of how the reader arrived (see §7). **This library layer is the site's primary channel for new, unknown visitors:** the SEO audit and organic acquisition strategy (Linear CC-5 and related work) target these canonical entry pages specifically, and their quality and indexability are treated as foundational, not secondary. Programs are the product a returning, invested parent uses; library pages are how a first-time stranger finds the site at all. Their design (article-first, an epigraph-treated confession excerpt, prev/next through the document or through a series of essays) carries over unchanged from the prior draft; it is demoted in *internal navigation* priority relative to programs, not in *acquisition* priority — see §3.

Type & spacing (unchanged): reading column max-width 44rem (~680px), 44px gutters on mobile. Title: Cinzel 600, 2.25rem desktop / 1.5rem mobile. Body: Marcellus ~1.125rem, leading 1.8, color #211e19. Blockquote: left border 2px solid black, padding-left 1rem, italic, trailing scripture citation in tracked Cinzel caps.

## 7. Search Results vs. Canonical Pages

`/search` is a transient, query-bound view: it exists only while a query is active, always shows the match count and the query itself, and every row is a short excerpt that links away. This section concerns the *in-app search results page* only — it is not a statement about organic/external search as an acquisition channel, which is covered by §6 and is a first-order priority for the library layer. Canonical pages — a library entry, a reflection essay, a program's teaching notes — never mention "matches," never show a query, and are what search rows, tables of contents, external search-engine results, and inbound links all resolve to identically. Rule: "SHOWING n OF m TOTAL MATCHES" and query text render only on `/search`.

## 8. Homepage

The homepage's job is to get a parent back into today's session as fast as possible. For a reader with an active program, the top of the page — above the fold, first paint — shows a "Continue Where You Left Off" card per child with a program in progress (one card if there's one child, several stacked if there are more) — the program's name, the child's name plainly on the card, a plain progress line, and a single "Continue Today's Session" action per card. Below that, Programs generally is browsable (a reader with no active program yet sees this first). Below that, in supporting position: latest reflections, then a quiet line into the library. Search is an icon beside the wordmark, reachable, never featured.

For a reader with no account or no active program, the same page still leads with Programs — browse and start one — rather than an essay. An essay-led masthead is no longer the homepage's job. Note this is the homepage's job for a *returning or converting* visitor; a first-time visitor arriving via organic search almost never lands on the homepage at all — they land on a library entry (§6) — so homepage design is not the site's primary acquisition lever.

## 9. Index Pages

`/programs`: a plain list, grouped loosely by kind (family catechesis, scripture, devotional), each row showing what it is, who it's for, and — if in progress — a one-line status. `/reflections`: a typeset table of contents, grouped by series then standalone essays. `/library`: a plain list of documents. `/authors/[slug]`: the same row pattern, filtered to one author.

## 10. Discoverability

A single quiet marker — a small dagger glyph (†) plus, where there's room, the label "COMMENTARY" — appears next to any library entry that has an essay: in search results, in tables of contents, beside the entry title on its own page. No color, no badge shape. Separately, any library entry that belongs to a program shows which one, so a reader browsing the library directly can discover the paced way to work through it.

## 11. Accessibility

- Body ink #211e19 on background #faf9f6 (~15.8:1); secondary text #5c574c (~6.3:1) — both clear of AA. Never drop secondary text lighter than ~4.7:1.
- 44rem reading column at ~17–18px keeps lines to roughly 68–75 characters; body leading 1.75–1.8.
- Icon-only prev/next, the mastery heart, and session step navigation all need descriptive aria-labels (e.g. "Mark Q. 7 recited without help"), never a bare unlabeled glyph.
- Epigraph and scripture blocks use semantic `<blockquote>`/`<cite>` markup, not styled divs.
- Tracked small-caps labels stay at 10–11px minimum with generous letter-spacing, never smaller, never for long text.

## 12. Onboarding & Child Records

Creating a child record is part of account onboarding, kept as light as possible: a name and an age (age, not birthdate — age is what drives pacing defaults in §5.4, and the app has no need to hold more precise birth data). No other fields at this stage. A child can also be added later from `/programs` — onboarding is not the only entry point, since a household's second or third child may arrive well after the account does. Starting a program requires choosing an existing child or adding one inline; there is no separate "manage children" screen beyond this.

Account/auth mechanism itself (email+password vs. magic link vs. social login) remains unspecified — see §16.

## 13. Monetization

The product is free, with no paywalled feature, tier, or account limit. Support is solicited as a donation, framed around a single clear promise: **every dollar given goes 100% to supporting missionary church planters** (partner organization(s) to be finalized). Because "100%" is a claim that must actually hold, not just read well, the mechanism matters: donations should route directly through an existing missions organization's own giving/payment platform rather than being collected and redistributed by this product, so that payment processing fees and any redistribution logic are the partner org's concern, not a gap in the "100%" claim. If direct routing isn't feasible, the alternative (collecting and forwarding donations) requires its own accounting, a named partner, and a decision on tax-deductibility/receipting before the claim can be made publicly. This decision is a prerequisite for shipping the donation flow, not a detail to settle after copy is written.

No donation prompt appears inside a session (§5.2's "nothing else" principle applies); a support/donate entry point lives in general navigation or the homepage's supporting region only.

## 14. Explicitly Deferred

Spaced-repetition scheduling beyond the pacing controls in §5.4; streak/consistency gamification; a dedicated flashcard/drill screen; parent-verified recitation beyond a simple manual mark; child-specific login or mode; reading-plan reminders/notifications; comments; broader user accounts beyond what program tracking requires; teaching notes (§5.3) beyond the first program. Revisit only if usage shows clear demand — each adds product surface the catechizing use case doesn't need.

## 15. Validating the Model

Raw signups are not the signal — a parent creating an account proves curiosity, not that catechizing-via-app works. The funnel that matters:

- **Activation** — a parent starts a program for a child (this is the real "trial," since it requires committing to a specific child and catechism).
- **First value** — completes session 1.
- **Retention signal** — returns to complete a second session within 7 days of the first.
- **Habit signal** — still completing sessions in week 4.

A working bar for "people want this, build the iOS app": **~100 programs started, ≥30% return for a second session within a week, ≥15% still active at week 4.** Hitting activation with a sharp drop after session 1 points at the session itself (§5.2) or pacing defaults (§5.4), not at demand — that's a different fix than low activation, which would point at the homepage/onboarding funnel instead. Track this per-program once more than one exists, since a catechesis plan and a devotional path will likely retain differently.

## 16. Open Questions

- Branding: keep "Confessional Christianity" as-is, vs. a name change that better signals the catechizing focus — deferred until this direction is validated.
- Exact account/auth model needed to support program profiles (email+password vs. magic link vs. social login) — not yet specified.
- Whether non-catechesis programs (Bible-in-a-year, topical devotionals) get built out with the same eventual depth of "teaching notes," or stay intentionally lighter since the parent-equipping need is specific to catechizing a child.
- Whether the accent ochre used for "mastered" should extend anywhere else in the system, or stay scoped to program tracking only (current recommendation: stay scoped).
- Which missions partner organization(s) receive donation routing, and whether "100%" is a promise this product can make on day one or only once a partner giving-platform integration is in place.