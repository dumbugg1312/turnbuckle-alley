import type { Line } from './types';

/**
 * Town talk. When something happens (your debut, a first win, a title, Earl's
 * book in the library window, a raccoon beating Gus for the microphone cord),
 * world/memory.ts writes it down as dated news, and for about a week three or
 * four people bring it up. The first time someone can mention it, they do.
 *
 * News ids come from world/memory.ts (recordMatch and NEWS_FLAGS). {subject}
 * is the short name of whoever the news is about.
 *
 * Kayfabe: marks only react to what happened in public. Anything only
 * insiders know about stays in `place: ['insider']`.
 */
const N = (news: string, text: Line['text'], extra: Omit<Line, 'text' | 'when'> & { when?: Line['when'] } = {}): Line => ({
  ...extra,
  text,
  when: { news, ...extra.when },
});

export const GOSSIP: Record<string, Line[]> = {
  // ------------------------------------------------------------------ your career
  pip: [
    N('debut', ["You WRESTLED! I saw! I was in row C! I yelled your name so loud a man in row D turned around.", "He said 'who's that?' I said 'MY FRIEND.' He said 'okay.'"], { mood: 'happy' }),
    N('first_win', "Your FIRST WIN! I held my belt up the whole three-count. My arms are still tired. I'm going to be tired all week. Worth it.", { mood: 'happy' }),
    N('title_win', ["You have a REAL belt now. A real one!", "Can we stand next to each other and hold them up? Mine's cardboard. It still counts. Papa said so."], { mood: 'surprised' }),
    N('earl_book_pebble', "There's a book in the library window about a sparrow. I read it four times. The librarian kept glaring at me. I think he liked that I read it four times.", {}),
    N('earl_book_own', ["The Mountain wrote a BOOK. About a SPARROW.", "I'm not scared of him anymore. I'm a little scared. I'm scared and I like him. Is that allowed?"], { mood: 'surprised' }),
    N('jobber_won', "Jobber WON. He beat Gus for the cord! Gus said it on the microphone! Jobber's the champion now. Of the cord. I'm still champion of everything else.", { mood: 'happy' }),
    N('bev_badge', "You're a DEPUTY? Can you arrest the Dust Devil? Can you arrest my bedtime? I'm asking for real.", { mood: 'surprised' }),
    N('wanda_ten', "Wanda woke up and the FIRST thing she did was bow at you. I was there! I had a sign! She bowed at my sign second.", { mood: 'happy' }),
    N('dust_devil_unmasked', ["The Dust Devil was COWBOY CLINT. The whole time!", "Lacey's dad! I booed him for two YEARS. I'm going to make him a sign that says SORRY. With glitter. Lots."], { mood: 'surprised' }),
    N('dating_public', "Are you and {subject} in LOVE? Luz says yes. I say gross. ...I say it's a little nice. Luz can never know I said nice.", { mood: 'happy' }),
  ],
  agnes: [
    N('debut', "Your first match. I wrote the date in the front of my Bible, with the births and the weddings. In ink.", { mood: 'happy', when: { alignment: ['face', 'tweener'] } }),
    N('title_win', "A championship. I've taken Gertrude to the beauty parlor in your honor. She doesn't need it. It felt like an occasion.", { mood: 'happy', when: { alignment: ['face', 'tweener'] } }),
    N('earl_book_pebble', ["There's a sparrow book in the library window by an E. O. Pebble. I read it standing at the window.", "Nobody named Pebble lives in this county. I've checked. I ran the switchboard."], {}),
    N('tiny_pie', ["The judge had a head cold, dear. I'm not saying that's why. I'm saying it was August and the man was sniffling.", "Her lattice was very straight. I'll give her the lattice. Gertrude won't."], { mood: 'smug' }),
    N('gideon_hair_match', "Hair against hair at Harvest Havoc. I've waited fifty years to see a man that vain stand that close to clippers. I've bought a new hat for it.", { mood: 'smug' }),
    N('dust_devil_unmasked', ["Clint Ransom. The Dust Devil was Clint Ransom. Mocking himself on the radio for two years.", "I've hit that man with Gertrude. Twice. I'm bringing him a pie. I'm not sorry about the swings."], { mood: 'surprised' }),
    N('pip_ten', "The Abernathy boy held up a sign at the show. MY HERO IS MY FRIEND. Silver marker. I had to borrow his father's handkerchief.", { mood: 'love' }),
    N('dating_public', "You and {subject}. I've updated the church directory. In pencil. For now.", { mood: 'smug' }),
    N('engaged', "Engaged! To {subject}! I'll need the date for the bulletin. And a seat. A1, if it's in a ring. It's always A1.", { mood: 'happy' }),
  ],
  june: [
    N('debut', "First match in the books, baby. Real mug for a week. Then we'll see what you are.", { mood: 'happy', when: { place: ['public'] } }),
    N('rough_night', "Rough one. I heard it on the kitchen radio. Sit. Grits and an egg and don't you say one word till the plate's clean.", { when: { place: ['public'] } }),
    N('earl_book_pebble', "Somebody wrote a book about a sparrow and put it in the library window. Half my counter read it on their lunch. The other half's on the waiting list. Nobody's tipping.", {}),
    N('tiny_pie', "Tiny won the pie ribbon. Agnes came in for coffee after and ordered a slice of my pie, which is her recipe, and looked at it for a long time.", {}),
    N('gideon_hair_match', "Gideon Price put his hair on a flyer. He came in for toast this morning and held the menu in front of his face the whole time.", { when: { place: ['public'] } }),
    N('dating_public', "You and {subject}. Mm-hm. I'm putting two straws in your milkshake. Don't fight me. I own the straws.", { mood: 'smug' }),
    N('birdie_roof', "She brought me a tomato this morning. Off the roof. Didn't say a word. Just set it by the register like a cat leaving a mouse. Your doing, I suppose.", { mood: 'happy', when: { place: ['insider'] } }),
    N('truth_revealed', "She sat in my booth last night and didn't order anything. Four hours. I kept the coffee coming and my mouth shut. Hardest shift I've ever worked.", { mood: 'sad', when: { place: ['insider'] } }),
    N('engaged', "Engaged? To {subject}? I'm catering. I've already started the jollof in my head. Don't argue. It's already in my head.", { mood: 'happy' }),
  ],
  gus: [
    N('debut', "Your first ring card's in the shoebox. Name spelled right, which is more than I got. I checked it twice. I'll check it again tonight.", { mood: 'happy', when: { place: ['insider'] } }),
    N('jobber_won', ["He won. He WON. I said it on air. 'The cord... has a new... owner.'", "I've given him the cord. I bought a new one. He sleeps on the old one. It's the happiest I've ever seen a roommate."], { mood: 'surprised' }),
    N('pip_ten', "I saw the Abernathy boy's sign from the booth. MY HERO IS MY FRIEND. I had to cough into the microphone so nobody heard me. Old Thunder knows.", { mood: 'love' }),
    N('truth_revealed', "I drove her to that depot forty years ago, and this week I drove past it twice without meaning to. The truck knows the way. Turns out the truck always knew.", { mood: 'sad', when: { place: ['insider'] } }),
    N('engaged', "ENGAGED! Ladies and gentlemen! ...Sorry. I'm going to need to announce it. At the wedding. Full volume. I've already started stretching the vowels.", { mood: 'happy' }),
  ],
  birdie: [
    N('first_win', ["First win, sugar. I wrote it on a napkin and it's on the corkboard. Next to the sellout from '88.", "Don't look so pleased. I put it there so I'd remember to fine you for celebrating."], { mood: 'happy', when: { place: ['insider'] } }),
    N('hank_new_ring', "Hank tells me you two are drawing up a ring for some other town. A whole new ring. I'm jealous of a town I've never been to. That's a new feeling. I don't care for it.", { when: { place: ['insider'] } }),
    N('mothman_revealed', "You've got a look on your face like you're carrying something. Don't hand it to me, sugar. Some things I'd rather not know. I've earned one mystery.", { when: { place: ['insider'] } }),
  ],
  lou: [
    N('first_win', "Heard you won your first. I sang a verse to the creek about it. The bluegill weren't impressed. The bluegill never are.", { mood: 'happy' }),
    N('bev_badge', "Bev pinned a star on you? Lord. I've been in this town fifty years and Bev's never once trusted me with her tomatoes.", { mood: 'happy' }),
    N('truth_revealed', ["She knows. Birdie knows. I can stop carrying it on Mondays.", "I walked to the post office anyway this morning. Habit. Stood in line. Got to the front and didn't have anything to mail. Bought a stamp. Felt good."], { mood: 'sad', when: { place: ['insider'] } }),
    N('grandma_in_town', "Somebody moved into Room 7 at the Bell. I walked past twice. I'm seventy-seven. I can walk past a building twice if I want.", { when: { place: ['public'] } }),
  ],
  bev: [
    N('first_win', "First win. I logged it. Not a crime. I logged it anyway. Some things deserve a form.", { mood: 'happy' }),
    N('earl_book_pebble', ["There's a book in the library window. A sparrow. By an E. O. Pebble.", "I read it on my lunch break, standing up, and had to go sit in the cruiser for a while. On duty. I've written myself a warning."], { mood: 'sad' }),
    N('earl_book_own', ["Earl Odom wrote the sparrow book. The MOUNTAIN.", "I've moved his photo on the board from the middle row to the top corner, next to Doug. Doug doesn't mind. Doug's read it."], { mood: 'surprised' }),
    N('jobber_won', "The raccoon beat Gus for the microphone cord, I hear. On the radio. In public. I'm not pressing charges. I'm proud of him. Don't put that in the file.", {}),
    N('patty_regionals', "Coach Kowalski's team lost regionals by a point. I drove past the school after. Her truck was the last one in the lot. I parked across the street till it left.", { mood: 'sad' }),
    N('dust_devil_unmasked', ["Clint Ransom. CLINT RANSOM. Two years on my board as Public Enemy Number One.", "I'm taking him down. The photo. Not the man. I'm putting it on the back. With the good eggs."], { mood: 'surprised' }),
    N('pip_ten', "The Abernathy boy's sign. I saw it from the barricade. I had to turn around and face the crowd for a minute. Crowd control.", { mood: 'love' }),
  ],
  oakes: [
    N('title_win', "A champion in my town! I've asked Hank for a key to the city. A bigger one. She said the size doesn't matter, it still opens nothing. I said make it bigger anyway.", { mood: 'happy' }),
    N('bev_badge', "A deputy! I'd like to swear you in again, officially, on the Town Hall steps. Bev says once is enough. Bev doesn't understand ceremony.", { mood: 'happy' }),
    N('reunion_done', "I'm declaring next Saturday Velvet Hammers Day. Retroactively, it's been every Saturday since 1983. The council voted. One abstention. Dahlia faction.", { mood: 'happy' }),
  ],
  hank: [
    N('title_win', "That belt you're carrying. I set the plate on that. Don't drop it on concrete. Drop it on anything else, it's fine. Not concrete.", { when: { place: ['insider'] } }),
    N('truth_revealed', "Changed one lock forty years ago without asking why. Now I know why. I'd change it again. I'd just ask first this time.", { when: { place: ['insider'] } }),
  ],
  clementine: [
    N('five_star', ["{stars} stars. I gave you and {opponent} {stars} stars. In print.", "I've never done that on a weeknight. Lavinia wrote to ask if I was feeling well."], { mood: 'happy', when: { lastMatch: { minStars: 4.5, maxDaysAgo: 7 } } }),
    N('gideon_hair_match', "Hair versus hair. I've written the headline and a farewell column for the pompadour. In case. The hair would merely be moving away.", { mood: 'smug' }),
    N('reunion_done', "Every copy of Sunday's paper sold by seven a.m. I printed four hundred more. Those sold by nine. The press is still warm. I sat on it.", { mood: 'happy' }),
  ],
  patty: [
    N('five_star', ["That match. I watched it in slow motion twelve... fourteen... I watched it a lot of times.", "I found nothing. Nothing! Do you understand how upsetting that is?"], { mood: 'angry' }),
    N('dust_devil_unmasked', "Clint Ransom was the Dust Devil. So he was mocking HIMSELF. For two years. That's either the fakest thing I've ever heard of or the realest. I've been up all night.", { mood: 'surprised' }),
    N('bev_badge', "Bev made you a deputy? With a cereal-box star? ...Laminated. No bubbles. I respect the lamination.", {}),
  ],
  arlo: [
    N('five_star', "I gave you and {opponent} a 4.9. Then I changed it. Then I changed it back. Then I made a new column called UNDENIABLE.", { mood: 'happy', when: { notFlag: 'prologue', lastMatch: { minStars: 4.5, maxDaysAgo: 7 } } }),
  ],
  hazel: [
    N('five_star', "That was a clean match. I watched your feet the whole time. I'd frame the footwork if footwork could be framed. It can't. I asked Marigold.", { when: { place: ['insider'] } }),
  ],
  nadia: [
    N('rough_night', ["I heard about the match. I brought you a cold pack. And another cold pack. And a juice box.", "Follow my finger. ...Good. Okay. Good. My hands are shaking. That's normal. For me."], { mood: 'sad' }),
    N('wanda_ten', "Clint says Wanda came out of the den and bowed to you before breakfast. Before BREAKFAST. I've been her vet three years. She's never skipped breakfast for me.", { mood: 'surprised' }),
  ],
  doc: [
    N('rough_night', "Rough night. Show me where. ...Slowly. Sit. Breathe out. The ones that feel the worst usually aren't. The ones that feel fine I worry about.", { when: { place: ['insider'] } }),
  ],
  tiny: [
    N('rough_night', "Rough match, I heard. Sorry! Here. (She presses a cake the size of a thimble into your hand.) It's a sorry cake. I make a lot of these.", {}),
    N('earl_book_own', ["Earl wrote a BOOK! About a SPARROW! He read it to me in the van on Monday at a red light.", "We missed the green. And the next green. Somebody honked. I honked back. Sorry! I was crying."], { mood: 'happy' }),
    N('tiny_pie', ["I won by a lattice strip. Agnes says the judge had a cold. The judge did NOT have a cold. I asked him. I brought him soup to ask.", "...He did have a little cold."], { mood: 'smug' }),
  ],
  fenwick: [
    N('earl_book_pebble', ["(whispering) E. O. Pebble. Nobody's ever seen him. No photo. No address.", "A writer nobody's seen, who writes about a creature with wings. I'm not saying. I'm just saying."], {}),
    N('tiny_pie', "Tiny won the ribbon. I took nineteen photos. All of them are of the ribbon. None of them are of Tiny. I couldn't. My hands wouldn't.", { mood: 'love' }),
    N('bev_badge', "(whispering) You're a deputy now. Officially. So if I report a sighting, you have to take the report. Legally. I've printed forms.", { mood: 'smug' }),
  ],
  earl: [
    N('tiny_pie', "Tiny won the pie ribbon. She held it up in the van and we both forgot to drive. A man honked. I... honked back. Gently.", { mood: 'happy', when: { place: ['insider'] } }),
  ],
  marigold: [
    N('gideon_hair_match', ["Gideon came in for a hair net. For the hair match. A *decorative* one.", "I'm making it out of the same rose-gold as the robe. If the hair goes, the net goes with it, in style. I've cried twice. He's cried four times."], { when: { place: ['insider'] } }),
    N('hank_new_ring', "Hank says you two are building a ring somewhere new. I want to do the apron skirt. Don't let her say no. She'll say no first. Then she'll say 'fine.'", { when: { place: ['insider'] } }),
  ],
  dex: [
    N('hank_new_ring', "A new ring? In a new town? Can I be the first bump in it? I'll bump so good. I'll bump like a quarter in a dryer.", { mood: 'happy', when: { place: ['insider'] } }),
    N('pip_ten', "Pip's sign. MY HERO IS MY FRIEND. Luz made me one too. It says MY BROTHER IS FINE I GUESS. It's on the fridge. It's the best sign I've ever gotten.", { mood: 'happy' }),
  ],
  mo: [
    N('jobber_won', "Jobber was waiting at the creek road this morning holding the microphone cord. He wanted me to see it. I gave him two crackers. A title is a title.", { mood: 'happy' }),
  ],
  professor: [
    N('patty_regionals', "Patty's team lost regionals by one point. One. She sat at the top of the bleachers after. I didn't go up. I sat at the bottom. She knew I was there.", { mood: 'sad' }),
  ],
  lacey: [
    N('patty_regionals', "I lost by one point at regionals. Coach said we learn it. I said I'll learn it. Then I went home and threw my shoe at the radio. It wasn't on. It just felt right.", { mood: 'angry' }),
    N('wanda_ten', "Dad says Wanda came out of the den and bowed to YOU before breakfast. I'm not jealous. I'm a little jealous. She bowed at me second. That counts.", {}),
    N('dust_devil_unmasked', ["He was the Dust Devil. My dad. The whole time.", "I have a dartboard with his face on it. I'm keeping it. I'm keeping both of them. I don't know what that means yet."], { mood: 'sad' }),
  ],
  clint: [
    N('wanda_ten', "She came out of the den and looked for you before she looked for breakfast. I've told everybody at the feed store. Twice. Lorraine says I'm repeating myself. I am.", { mood: 'happy' }),
  ],
  bo: [
    N('patty_regionals', "Aunt Patty's team lost by one at regionals. Buck and I brought her cookies. I made them. Buck carried them. He ate two on the way. I counted.", { when: { place: ['insider'] } }),
  ],
  gideon: [
    N('earl_book_own', "Earl wrote a children's book with his own name on it. In *public.* I've never been prouder of anyone. I'm also, very slightly, jealous. My hair book is still in the safe.", { mood: 'happy', when: { place: ['insider'] } }),
    N('dating_public', "You and {subject}, darling. The whole salon is talking. I've done nothing to stop it. I've done a little to help.", { mood: 'smug' }),
    N('grandma_in_town', "A woman moved into Room 7 at the Bell with one hatbox and a crown braid that somebody's been doing wrong for years. I'm going to fix it. I've already bought the pins.", { when: { place: ['insider'] } }),
  ],
  jobber: [
    N('jobber_won', "(Jobber is wearing the microphone cord like a championship belt. It drags behind him for six feet. He refuses to coil it.)", { mood: 'happy' }),
  ],
};
