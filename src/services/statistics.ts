// Figures shown on the score page, computed from the saved results:
// { [day]: score } where score is the number of guesses (1 to 6), 0 for a loss.

export interface Statistics {
  played: number;
  won: number;
  winRate: number; // 0 to 100
  currentStreak: number;
  bestStreak: number;
  // number of games won in 1, 2, … 6 guesses, then lost games
  distribution: number[];
}

const isDay = (key: string) => /^\d+$/.test(key);

// A streak is a run of consecutive days won. The current one still counts
// while today's game has not been played yet.
export const computeStatistics = (
  stats: Record<string, number>,
  today: number,
): Statistics => {
  const results = Object.entries(stats)
    .filter(([key]) => isDay(key))
    .map(([day, score]) => ({ day: parseInt(day), score }))
    .sort((a, b) => a.day - b.day);

  const distribution = [0, 0, 0, 0, 0, 0, 0];
  let bestStreak = 0;
  let streak = 0;
  let streakEnd = -2;

  for (const { day, score } of results) {
    distribution[score >= 1 && score <= 6 ? score - 1 : 6]++;
    if (score > 0) {
      streak = day === streakEnd + 1 ? streak + 1 : 1;
      streakEnd = day;
      bestStreak = Math.max(bestStreak, streak);
    } else {
      streak = 0;
    }
  }

  const played = results.length;
  const won = played - distribution[6];

  return {
    played,
    won,
    winRate: played ? Math.round((won / played) * 100) : 0,
    currentStreak: streak > 0 && streakEnd >= today - 1 ? streak : 0,
    bestStreak,
    distribution,
  };
};
