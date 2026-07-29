export type DailyVerse = {
  reference: string;
  text: string;
};

/** Curated static verses — not derived from user or request input. */
export const DAILY_VERSE_CATALOG: readonly DailyVerse[] = [
  {
    reference: "Psalm 23:1",
    text: "The Lord is my shepherd; I shall not want.",
  },
  {
    reference: "Philippians 4:13",
    text: "I can do all things through Christ who strengthens me.",
  },
  {
    reference: "Jeremiah 29:11",
    text: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.",
  },
  {
    reference: "Isaiah 41:10",
    text: "Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand.",
  },
  {
    reference: "Romans 8:28",
    text: "And we know that for those who love God all things work together for good, for those who are called according to his purpose.",
  },
  {
    reference: "Proverbs 3:5-6",
    text: "Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.",
  },
  {
    reference: "Matthew 11:28",
    text: "Come to me, all who labor and are heavy laden, and I will give you rest.",
  },
  {
    reference: "Joshua 1:9",
    text: "Be strong and courageous. Be fearless and undismayed — the Lord your God is with you always.",
  },
  {
    reference: "Psalm 46:10",
    text: "Be still, and know that I am God.",
  },
  {
    reference: "John 16:33",
    text: "In the world you will have tribulation. But take heart; I have overcome the world.",
  },
  {
    reference: "2 Timothy 1:7",
    text: "For God gave us a spirit not of fear but of power and love and self-control.",
  },
  {
    reference: "Lamentations 3:22-23",
    text: "The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning; great is your faithfulness.",
  },
] as const;
