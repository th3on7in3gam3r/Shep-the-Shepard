export function getStreakMessage(
  streak: number,
  questCompleteToday = false,
): string {
  if (streak === 0 && !questCompleteToday) {
    return "Complete today's Daily Quest to start your faith streak.";
  }
  if (streak === 0 && questCompleteToday) {
    return "Day one complete — your streak has begun!";
  }
  if (streak === 1) {
    return "Day one — every journey with God starts with a single step.";
  }
  if (streak < 7) {
    return `${streak} days in a row! Shep is cheering you on.`;
  }
  if (streak < 30) {
    return `${streak}-day streak — you're building a beautiful habit in God's Word.`;
  }
  return `${streak} days strong! Your faithfulness is inspiring.`;
}

export function formatStudyTime(totalMinutes: number): string {
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
