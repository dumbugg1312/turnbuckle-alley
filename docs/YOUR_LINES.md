# Writing your own lines

Anything you write goes into one file: `src/data/dialogue/handwritten.ts`. Every main character already has an empty list there with a comment saying who they are. Lines you add get top priority: the first time one of them fits the moment, that character says it before anything else. After that it stays in their regular rotation, and comes up a little more often than the rest.

## The shape of a line

```ts
birdie: [
  { text: "Somebody left a tomato on my desk. I'm not asking." },
  { text: ["Two boxes in a row.", "Like this."], when: { hearts: [4, 10], place: ['insider'] } },
  { text: "Rain again. Section C's leaking.", when: { weather: ['rain'], map: ['sportatorium'] }, mood: 'sad' },
],
```

- `text` is one box, or a list of boxes shown one after another. Keep each box under about 140 characters so it fits on a phone.
- `when` is optional. Leave it out and the line can come up any time.
- `mood` picks the portrait face for the first box: `neutral`, `happy`, `sad`, `angry`, `surprised`, `smug` or `love`.
- `once: true` means the line is only ever said once.
- Remember the comma after each `}`. Run `npx tsc --noEmit` afterwards; it will point at the exact line if something is off.

## Conditions you can use

Put any of these inside `when: { ... }`. A line only comes up when all of its conditions are true.

| Condition | Example | Meaning |
|---|---|---|
| `hearts` | `hearts: [3, 10]` | Friendship from 3 to 10 hearts (up to 14 when dating) |
| `place` | `place: ['insider']` | `public` (marks can hear), `insider` (back booth, locker room, Birdie's office), `home`, `show` |
| `map` | `map: ['diner', 'library']` | Where you are (map ids are listed in docs/DIALOGUE_BRIEF.md) |
| `weekday` | `weekday: [2, 5]` | 0 is Monday, 6 is Sunday. Shows are Wednesday (2) and Saturday (5) |
| `season` | `season: [0]` | 0 spring, 1 summer, 2 fall, 3 winter |
| `weather` | `weather: ['rain', 'storm']` | `sun`, `rain`, `storm`, `wind`, `snow` |
| `time` | `time: [360, 600]` | Minutes after midnight: 360 is 6 AM, 1200 is 8 PM |
| `showDay` | `showDay: true` | A Wednesday or Saturday show day |
| `flag` / `notFlag` | `flag: 'debuted'` | A story moment has (or hasn't) happened. Common ones: `met_birdie`, `debuted`, `lou_key`, `grandma_in_town`, `truth_revealed`, `reunion_done` |
| `rank` | `rank: ['main']` | `rookie`, `opener`, `undercard`, `midcard`, `main`, `assistant`, `pencil`, `owner` |
| `alignment` | `alignment: ['heel']` | You're a `face` (hero), `heel` (villain) or `tweener` |
| `dating` / `married` | `dating: true` | You're dating or married to this character |
| `lastMatch` | `lastMatch: { won: true, maxDaysAgo: 3 }` | Your last match, within the last few days. Also `opponent: ['earl']`, `venue: ['vfw']`, `minStars: 4`, `maxStars: 2`, `title: true` |
| `giftedRecently` | `giftedRecently: { maxDays: 5, item: ['honey'] }` | You gave them something in the last few days (optionally a particular item) |
| `daysSinceTalk` | `daysSinceTalk: [7, 99]` | You haven't talked to them for a week or more |
| `news` | `news: 'first_win'` | Something happened in town this week (see below) |

## Words that fill themselves in

Write these in curly braces and the game swaps in the real thing:

- `{name}` your name, `{ring}` your ring name, `{they}` `{them}` `{their}` your pronouns (`{They}` for the start of a sentence).
- With `lastMatch`: `{opponent}` (their ring name), `{finisher}` (the move that ended it), `{venue}` (the VFW or the Sportatorium), `{stars}`.
- With `giftedRecently`: `{lastGift}` (what you gave them, e.g. "jar of honey").
- With `news`: `{subject}` (who the news is about).

Only use these with the matching condition; the tests check that.

```ts
{ text: "{opponent} got you good. Ice it.", when: { lastMatch: { won: false, maxDaysAgo: 2 } } },
{ text: "That {lastGift} is on my windowsill.", when: { giftedRecently: { maxDays: 6 } } },
```

## News you can react to

`debut`, `first_win`, `title_win`, `five_star`, `rough_night`, `earl_book_pebble`, `earl_book_own`, `tiny_pie`, `gideon_hair_match`, `jobber_won`, `bev_badge`, `patty_regionals`, `wanda_ten`, `dust_devil_unmasked`, `pip_ten`, `grandma_in_town`, `truth_revealed`, `reunion_done`, `birdie_roof`, `hank_new_ring`, `mothman_revealed`, `dating_public`, `engaged`. Each stays fresh for about a week. The full list, with what sets each one, is `NEWS_FLAGS` in `src/world/memory.ts`; the existing reactions are in `src/data/dialogue/gossip.ts` if you want to see how other characters handle them.

## The house rules

- Kayfabe is absolute in public. A wrestler in a `public` place stays in character, and marks never hear how it's made.
- No death, ever, not even in a joke or a pet's backstory.
- Humor never punches down. Villains may mock Tiny's cakes, never her body.
- The tests (`npx vitest run`) watch for the old habits: no more than one "don't tell" per character, "eleven" kept rare, every birthday thank-you its own, and lines that end on a moral kept to a handful.
