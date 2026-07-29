import { todayKey } from "@/lib/date-utils";
import { getSeasonInfo, type SeasonInfo } from "@/lib/church-calendar";
import { getDailyQuestTheme, type DailyQuestTheme } from "@/lib/daily-quests";
import { getDailyDevotion, type Devotion } from "@/lib/devotions";
import { getDailyVerse, type DailyVerse } from "@/lib/daily-verses";

export type StudyChapter = {
  reference: string;
  text: string;
  translationName: string;
  translationId: string;
};

export type DailyPack = {
  dateKey: string;
  verse: DailyVerse;
  devotion: Devotion;
  questTheme: DailyQuestTheme;
  season: SeasonInfo | null;
  studyChapter: StudyChapter | null;
  cachedAt: string;
};

export const DEFAULT_STUDY_PASSAGE = "Psalm 23";

export function buildDailyPack(date = new Date()): DailyPack {
  return {
    dateKey: todayKey(date),
    verse: getDailyVerse(date),
    devotion: getDailyDevotion(date),
    questTheme: getDailyQuestTheme(date),
    season: getSeasonInfo(date),
    studyChapter: null,
    cachedAt: new Date().toISOString(),
  };
}

export function mergeStudyChapter(
  pack: DailyPack,
  studyChapter: StudyChapter,
): DailyPack {
  return {
    ...pack,
    studyChapter,
    cachedAt: new Date().toISOString(),
  };
}
