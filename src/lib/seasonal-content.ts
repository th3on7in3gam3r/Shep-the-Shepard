import type { LiturgicalSeason } from "@/lib/church-calendar";
import { getSeasonInfo } from "@/lib/church-calendar";
import type { DailyQuestTheme } from "@/lib/daily-quests";

type SeasonalQuestTheme = DailyQuestTheme & { season: LiturgicalSeason };

const ADVENT_QUESTS: readonly DailyQuestTheme[] = [
  {
    title: "Prepare the Way",
    prompt: "Advent begins in the heart — clear one small space for Christ today.",
  },
  {
    title: "Watchful Waiting",
    prompt: "Don't rush the season. Pause and listen for God's quiet arrival.",
  },
  {
    title: "Hope Candle",
    prompt: "Name one promise you're holding onto while you wait in faith.",
  },
  {
    title: "Prophets & Promises",
    prompt: "Read a familiar Advent verse slowly — let old words feel new.",
  },
  {
    title: "Room at the Inn",
    prompt: "Make room in your schedule for someone who needs kindness.",
  },
  {
    title: "Joy Approaches",
    prompt: "Share encouragement with someone who feels weary this season.",
  },
  {
    title: "Mary's Yes",
    prompt: "Pray: 'Be it unto me' — surrender one worry to God today.",
  },
  {
    title: "Emmanuel Near",
    prompt: "God-with-us is not far off. Where do you need His nearness tonight?",
  },
  {
    title: "O Come, O Come",
    prompt: "Sing or speak a line of an Advent hymn — worship stills the hurry.",
  },
  {
    title: "Almost Christmas",
    prompt: "The wait is holy. Thank God for what He is forming in you.",
  },
];

const LENT_QUESTS: readonly DailyQuestTheme[] = [
  {
    title: "Return to God",
    prompt: "Ash Wednesday truth: you don't need to be polished — only honest.",
  },
  {
    title: "Desert Walk",
    prompt: "Choose one small sacrifice that draws you nearer to Christ today.",
  },
  {
    title: "Mercy Hour",
    prompt: "Receive God's mercy first — then extend it to someone who hurt you.",
  },
  {
    title: "Crossward Steps",
    prompt: "Walk with the cross in view — not as burden, but as love's shape.",
  },
  {
    title: "Forty Days",
    prompt: "Lent is marathon, not sprint. Take one faithful step and rest in grace.",
  },
  {
    title: "Repentance & Rest",
    prompt: "Confess one thing honestly to God. He already knows — and still loves.",
  },
  {
    title: "Wilderness Bread",
    prompt: "When tempted to distract yourself, reach for Scripture instead.",
  },
  {
    title: "Wash One Another's Feet",
    prompt: "Serve someone quietly today — no announcement, just love.",
  },
  {
    title: "Psalms of Lament",
    prompt: "Bring your sorrow to God without fixing it. Lament is prayer too.",
  },
  {
    title: "Passion Approaches",
    prompt: "Read the Gospel slowly. Let Holy Week's weight prepare your heart.",
  },
  {
    title: "Palms & Tears",
    prompt: "Hosanna and heartbreak live close together. Be honest with God about both.",
  },
  {
    title: "Stay Awake",
    prompt: "Pray for ten minutes when you'd rather scroll. Watch with Jesus.",
  },
];

const HOLY_WEEK_QUESTS: readonly DailyQuestTheme[] = [
  { title: "Palm Sunday", prompt: "Welcome the King who comes in humility, not spectacle." },
  { title: "Monday in Holy Week", prompt: "Jesus cleared the temple — what needs clearing in your heart?" },
  { title: "Tuesday · Teachings", prompt: "Sit at Jesus' feet today. Let His words judge and heal you." },
  { title: "Wednesday · Stillness", prompt: "In the quiet before the storm, stay near the Shepherd." },
  { title: "Maundy Thursday", prompt: "Remember the upper room — love one another as He loved you." },
  { title: "Good Friday", prompt: "Stand at the cross. Let love speak louder than loss." },
  { title: "Holy Saturday", prompt: "Wait in hope between death and dawn. Silence is not abandonment." },
  { title: "Easter Dawn", prompt: "Christ is risen! Alleluia! Let joy interrupt your ordinary day." },
];

const ADVENT_SHEP_COMPLETE: readonly string[] = [
  "One more step toward Bethlehem. Well done.",
  "The candles burn brighter when your heart stays watchful. Beautiful work today.",
  "Advent is long, but you're walking it well. I'm proud of you.",
  "Hope looks good on you. See you tomorrow.",
];

const LENT_SHEP_COMPLETE: readonly string[] = [
  "You walked faithfully today. The Good Shepherd sees you.",
  "Forty days is a long road — and you took another step. Grace upon grace.",
  "Lent isn't about perfection. It's about returning. You returned today.",
  "The cross is nearer, and so is mercy. Well done.",
];

const ADVENT_SHEP_IDLE: readonly string[] = [
  "Advent stillness… I'm here while we wait for Christ.",
  "Quiet night over the fields… keep watch with me.",
  "The King is coming — not in hurry, but in love.",
  "Breathe. The season of waiting is holy too.",
];

const LENT_SHEP_IDLE: readonly string[] = [
  "Lenten quiet… walk slowly; Jesus is near.",
  "The desert isn't empty — God is in it with you.",
  "Less noise, more prayer. I'm here.",
  "Mercy meets us on the long road. Don't walk alone.",
];

export function getSeasonalQuestTheme(date = new Date()): SeasonalQuestTheme | null {
  const info = getSeasonInfo(date);
  if (!info) return null;

  if (info.season === "advent") {
    const idx = (info.dayInSeason - 1) % ADVENT_QUESTS.length;
    return { ...ADVENT_QUESTS[idx], season: "advent" };
  }
  if (info.season === "lent") {
    const idx = (info.dayInSeason - 1) % LENT_QUESTS.length;
    return { ...LENT_QUESTS[idx], season: "lent" };
  }
  const hwIdx = Math.min(info.dayInSeason - 1, HOLY_WEEK_QUESTS.length - 1);
  return { ...HOLY_WEEK_QUESTS[hwIdx], season: "holy-week" };
}

export type SeasonalDevotionSnippet = {
  title: string;
  reflection: string;
  prayer: string;
  theme: string;
  shepQuestion: string;
  reflectionPrompts: string[];
};

const ADVENT_DEVOTIONS: readonly SeasonalDevotionSnippet[] = [
  {
    title: "Advent · A Voice in the Wilderness",
    theme: "Hope",
    reflection:
      "John cried in the wilderness — prepare the way. Advent is not Christmas early; it is the honest work of making room. God still comes to hearts that feel unprepared, cluttered, or tired. You do not need a perfect house for the Holy Guest — only a willing one.",
    prayer:
      "Come, Lord Jesus. Prepare my heart as I wait in hope. Where I am distracted, gentle me. Where I am afraid, anchor me. Amen.",
    shepQuestion: "Where do you need God to come near this Advent?",
    reflectionPrompts: [
      "What are you waiting for God to do?",
      "Where did you sense hope today?",
      "What needs clearing before Christ arrives?",
    ],
  },
  {
    title: "Advent · Light in the Darkness",
    theme: "Peace",
    reflection:
      "A single candle changes a dark room. Isaiah promised a people walking in darkness would see a great light — not because the night ended instantly, but because Light entered it. Christ does not despise small beginnings in your soul. One honest prayer, one gentle yes, one moment of stillness — these are Advent offerings.",
    prayer:
      "Light of the world, shine where I feel dim. Teach me to wait without despair and to hope without hurry. Amen.",
    shepQuestion: "Where could you carry a little light for someone else?",
    reflectionPrompts: [
      "Where did darkness feel heavy today?",
      "Who needs your gentleness this week?",
      "What small light can you tend tonight?",
    ],
  },
  {
    title: "Advent · The Promise Keeper",
    theme: "Trust",
    reflection:
      "Centuries passed between promise and manger. God's people learned waiting the hard way — exile, silence, longing. Advent reminds us: delay is not denial. The One who spoke stars into being keeps His word. Trust Him in the in-between.",
    prayer:
      "Faithful God, I trust Your timing even when mine is impatient. Strengthen my waiting heart. Amen.",
    shepQuestion: "What promise are you struggling to believe right now?",
    reflectionPrompts: [
      "Where is waiting hardest for you?",
      "When has God been faithful before?",
    ],
  },
  {
    title: "Advent · Mary’s Magnificat",
    theme: "Gratitude",
    reflection:
      "Mary sang before the world saw what she carried. Gratitude in Advent is not pretending everything is easy — it is proclaiming God’s mercy while the story is still unfolding. The humble are lifted; the hungry are filled. Perhaps your praise today is the beginning of someone else's hope.",
    prayer:
      "My soul magnifies You, Lord. Help me praise before I fully understand. Amen.",
    shepQuestion: "What can you thank God for before the answer arrives?",
    reflectionPrompts: [
      "Name one hidden mercy from today.",
      "Who might need to hear hope from you?",
    ],
  },
  {
    title: "Advent · Peace on Earth",
    theme: "Peace",
    reflection:
      "Angels announced peace — not the absence of Rome’s armies, but the presence of reconciling love. Advent peace is deeper than calm circumstances. It is the shalom of God ruling in a heart that knows it is loved. Receive that peace today, then become it for someone else.",
    prayer:
      "Prince of Peace, still my racing heart. Let Your peace guard my mind in Christ Jesus. Amen.",
    shepQuestion: "Where do you need God's peace to guard your heart?",
    reflectionPrompts: [
      "What stole your peace today?",
      "How could you practice peace with one person?",
    ],
  },
  {
    title: "Advent · O Come, Emmanuel",
    theme: "Hope",
    reflection:
      "Emmanuel — God with us — is the whole gospel in two words. Advent whispers that loneliness is not the final truth. The Creator entered creation, not as distant thunder but as a child’s breath. Whatever feels far from God tonight, draw near anyway. He already has.",
    prayer:
      "Emmanuel, be with me in the ordinary hours. I need You near. Amen.",
    shepQuestion: "Where do you feel alone — and need to remember God is with you?",
    reflectionPrompts: [
      "Where did you sense God’s presence today?",
      "Who feels alone that you could be near to?",
    ],
  },
  {
    title: "Advent · The Inn Had No Room",
    theme: "Love",
    reflection:
      "There was no room at the inn — not because God miscalculated, but because the world often misses holy things in plain disguise. Advent asks: is there room in your calendar, your anxiety, your ambition? Love often arrives inconveniently. Make space anyway.",
    prayer:
      "Lord, I open my heart again. Displace what crowds You out. Amen.",
    shepQuestion: "What might you set down to make room for Christ?",
    reflectionPrompts: [
      "What fills your life louder than God?",
      "One practical way to make room this week?",
    ],
  },
  {
    title: "Advent · Almost Christmas",
    theme: "Joy",
    reflection:
      "The wait is almost over — yet Advent’s gift is learning that God is worth waiting for. Joy is not denial of hardship; it is the confidence that Love wins. As Christmas draws near, let your heart soften. The story you know by heart still has power to heal it.",
    prayer:
      "Joy of every longing heart, awaken wonder in me again. Amen.",
    shepQuestion: "Where do you need wonder to break through routine?",
    reflectionPrompts: [
      "What felt unexpectedly beautiful today?",
      "How can you share joy without performance?",
    ],
  },
];

const LENT_DEVOTIONS: readonly SeasonalDevotionSnippet[] = [
  {
    title: "Lent · Return to Me",
    theme: "Trust",
    reflection:
      "Ash Wednesday marks us with mortality — from dust, to dust — and with mercy — return to the Lord. Lent invites honesty, not performance. God meets us not when we have it together, but when we turn homeward with empty hands. Repentance is not self-hatred; it is coming home.",
    prayer:
      "Merciful Father, I return to You. Create in me a clean heart and renew a right spirit within me. Amen.",
    shepQuestion: "What do you need to bring honestly before God this Lent?",
    reflectionPrompts: [
      "Where did you sense God calling you back?",
      "What habit could you lay down for love of Christ?",
      "What does 'return' look like practically today?",
    ],
  },
  {
    title: "Lent · Into the Wilderness",
    theme: "Courage",
    reflection:
      "Jesus was led into the wilderness — not punished, but prepared. Lent strips away noise so we can hear the Shepherd’s voice. The desert feels barren, yet it is where appetite is reordered and trust is tested. You are not abandoned in your dryness; you are being formed.",
    prayer:
      "Lord, meet me in the wilderness. Teach me to live by every word from Your mouth. Amen.",
    shepQuestion: "What wilderness season is God using to form you?",
    reflectionPrompts: [
      "What temptation keeps calling you away from God?",
      "Where did you choose faith over comfort?",
    ],
  },
  {
    title: "Lent · Take Up Your Cross",
    theme: "Courage",
    reflection:
      "Following Jesus is not only comfort — it is courage. The cross is the shape of love that refuses to turn away when love is costly. Lent reorients us: glory looks like service, strength looks like surrender. What small cross is yours to carry today — not to earn love, but because you are loved?",
    prayer:
      "Jesus, give me grace to follow You today — cross and all. Amen.",
    shepQuestion: "Where is God asking you to love sacrificially?",
    reflectionPrompts: [
      "What felt costly to love today?",
      "Where did you sense God today?",
    ],
  },
  {
    title: "Lent · Mercy, Not Sacrifice",
    theme: "Love",
    reflection:
      "God desires mercy, not sacrifice — meaning religion without compassion misses the point. Lent fasting is not a scoreboard; it is space for love to grow. If you give up something, let it free you to notice others. The fast God chooses is to loose the chains of injustice and share your bread.",
    prayer:
      "Lord, soften my heart toward those I overlook. Teach me mercy that acts. Amen.",
    shepQuestion: "Who needs mercy from you — not advice, but presence?",
    reflectionPrompts: [
      "Who did you see today that others ignored?",
      "How can mercy become practical tomorrow?",
    ],
  },
  {
    title: "Lent · Psalms in the Night",
    theme: "Hope",
    reflection:
      "Lament is Scripture’s honest prayer — My God, why have You forsaken me? Jesus prayed psalms on the cross. Lent gives permission to grieve without pretending. Hope does not erase the ache; it walks beside it. Bring your questions to God; He is not afraid of them.",
    prayer:
      "God of the night seasons, hold what I cannot fix. Be my hope when I cannot see morning. Amen.",
    shepQuestion: "What sorrow needs to be spoken honestly to God?",
    reflectionPrompts: [
      "Where did grief or doubt visit you today?",
      "What psalm or verse holds you tonight?",
    ],
  },
  {
    title: "Lent · Wash One Another’s Feet",
    theme: "Love",
    reflection:
      "On the night He was betrayed, Jesus knelt and washed feet. Lent leadership looks like towel and basin, not platform and pride. Greatness in the kingdom is measured in hidden service. Who can you serve today without needing credit?",
    prayer:
      "Servant King, bend my pride. Show me one humble act of love to perform today. Amen.",
    shepQuestion: "Who could you serve quietly today?",
    reflectionPrompts: [
      "When did pride block love recently?",
      "What hidden kindness can you offer?",
    ],
  },
  {
    title: "Lent · By His Wounds We Are Healed",
    theme: "Peace",
    reflection:
      "Isaiah saw the suffering servant — wounded for our transgressions. Lent turns our eyes toward costly love before Easter turns them toward empty tomb. Do not rush past the pain; let it teach you how deeply you are loved. Healing often passes through honesty about the wound.",
    prayer:
      "Healer of souls, touch what I hide. Thank You for love that does not look away. Amen.",
    shepQuestion: "Where do you need healing you’ve been afraid to ask for?",
    reflectionPrompts: [
      "What wound still shapes your fears?",
      "Where did grace surprise you today?",
    ],
  },
  {
    title: "Lent · Stay Awake",
    theme: "Wisdom",
    reflection:
      "In Gethsemane, disciples slept while Jesus prayed in agony. Lent calls us to spiritual wakefulness — not anxious hyper-vigilance, but loving attention to God. What lulls your soul to sleep? Screens, hurry, cynicism? Watch with Him one hour, even if your flesh is weak.",
    prayer:
      "Lord, keep me awake to Your presence. When I drift, gently rouse my heart. Amen.",
    shepQuestion: "What keeps you spiritually drowsy — and how can you wake up?",
    reflectionPrompts: [
      "When did you choose distraction over prayer?",
      "What would 'watch one hour' look like for you?",
    ],
  },
  {
    title: "Lent · Passion Week Approaches",
    theme: "Trust",
    reflection:
      "The road narrows toward Jerusalem. Lent’s final stretch is not endurance for its own sake — it is accompaniment. Walk the last miles with Jesus, not as spectator but as disciple. What He suffers, He suffers for love of you. Stay close.",
    prayer:
      "Jesus, I will walk with You toward the cross. Do not let me look away. Amen.",
    shepQuestion: "What does it mean for you to stay near Jesus this week?",
    reflectionPrompts: [
      "Where did you sense God today?",
      "What fear needs surrender before Holy Week?",
    ],
  },
  {
    title: "Lent · Palms and Tears",
    theme: "Gratitude",
    reflection:
      "Hosanna and betrayal sit in the same week — praise and abandonment, crowds and loneliness. Lent teaches that following Jesus includes both alleluia and agony. Be honest about your mixed heart. God meets you there, not in sanitized devotion but in real faith.",
    prayer:
      "King and crucified Lord, receive my honest worship — palms, tears, and all. Amen.",
    shepQuestion: "Where is your heart both grateful and afraid?",
    reflectionPrompts: [
      "What are you praising God for today?",
      "What fear sits beside your praise?",
    ],
  },
];

const HOLY_WEEK_DEVOTIONS: readonly SeasonalDevotionSnippet[] = [
  {
    title: "Holy Week · Hosanna",
    theme: "Love",
    reflection:
      "The crowd shouted Hosanna — save us. Jesus rode in not as conqueror of armies but of death itself. Palm branches waved for a king they misunderstood. Holy Week begins with praise that will soon fall silent. Still, the King comes — humble, deliberate, loving you to the end.",
    prayer: "King of mercy, save me. Reign in my heart today. Amen.",
    shepQuestion: "What do you need saving from today?",
    reflectionPrompts: ["Where did you welcome Jesus today?"],
  },
  {
    title: "Holy Week · Upper Room",
    theme: "Trust",
    reflection:
      "Bread broken, cup poured — covenant in a meal. Jesus gave Himself before He gave Himself on the cross. Maundy Thursday is intimacy before agony: 'This is my body, given for you.' Receive again. Love one another as He has loved you.",
    prayer: "Lord, at Your table I remember. Make me a servant of Your love. Amen.",
    shepQuestion: "How might you love someone sacrificially this week?",
    reflectionPrompts: [
      "Who needs your forgiveness or faithfulness?",
      "Where did you sense God today?",
    ],
  },
  {
    title: "Holy Week · At the Cross",
    theme: "Hope",
    reflection:
      "Good Friday is not the end of the story — but we must not skip the grief. Love hung there for you: rejected, pierced, forsaken so you would never be. Let the cross judge your idols and heal your shame. Silence before resurrection is holy ground.",
    prayer: "Thank You, Jesus, for loving me to the end. I worship at the cross. Amen.",
    shepQuestion: "Where did you sense God's love at the cross today?",
    reflectionPrompts: [
      "Where did you sense God today?",
      "What does Christ's sacrifice mean for your tomorrow?",
    ],
  },
  {
    title: "Easter · He Is Risen",
    theme: "Hope",
    reflection:
      "The tomb is empty. What felt final to the disciples was the doorway to forever. Death did not have the last word — and it never will. Easter is not escapism; it is the announcement that every grave will yield to Love. Live today as someone whose story ends in life.",
    prayer:
      "Risen Lord, fill me with resurrection joy and send me to share it. Alleluia! Amen.",
    shepQuestion: "Where do you need resurrection hope in your life?",
    reflectionPrompts: [
      "Where did you sense God today?",
      "Who needs to hear that Christ is risen?",
    ],
  },
];

export function getSeasonalDevotion(date = new Date()): SeasonalDevotionSnippet | null {
  const info = getSeasonInfo(date);
  if (!info) return null;

  if (info.season === "advent") {
    return ADVENT_DEVOTIONS[(info.dayInSeason - 1) % ADVENT_DEVOTIONS.length];
  }
  if (info.season === "lent") {
    return LENT_DEVOTIONS[(info.dayInSeason - 1) % LENT_DEVOTIONS.length];
  }
  if (info.dayInSeason >= 7) {
    return HOLY_WEEK_DEVOTIONS[3];
  }
  return HOLY_WEEK_DEVOTIONS[(info.dayInSeason - 1) % 3];
}

export function getSeasonalShepLine(
  context: "quest-complete" | "chat-idle",
  date = new Date(),
): string | null {
  const info = getSeasonInfo(date);
  if (!info) return null;

  if (context === "quest-complete") {
    if (info.season === "advent") {
      return ADVENT_SHEP_COMPLETE[(info.dayInSeason - 1) % ADVENT_SHEP_COMPLETE.length];
    }
    if (info.season === "lent") {
      return LENT_SHEP_COMPLETE[(info.dayInSeason - 1) % LENT_SHEP_COMPLETE.length];
    }
    if (info.dayInSeason >= 7) {
      return "Christ is risen — what a day to finish your quest!";
    }
    return "You walked through Holy Week with faith. I'm proud of you.";
  }

  if (info.season === "advent") {
    return ADVENT_SHEP_IDLE[(info.dayInSeason - 1) % ADVENT_SHEP_IDLE.length];
  }
  if (info.season === "lent") {
    return LENT_SHEP_IDLE[(info.dayInSeason - 1) % LENT_SHEP_IDLE.length];
  }
  if (info.dayInSeason >= 7) {
    return "Easter joy… He is risen! I'm here to celebrate with you.";
  }
  return "Holy Week… I'm here in the stillness with you.";
}
