export const sendEvent = (event: string) => {
  if (process.env.NODE_ENV === "production") {
    try {
      cabin.event(event);
    } catch (e) {
      console.log(e);
    }
  }
};

interface StatsObject {
  firstPlayed: number;
  lastPlayed: number;
}

interface Statistics {
  firstQuartile: number;
  lastQuartile: number;
}

interface RawStats {
  score: number;
  count: number;
}

const calculateQuartiles = (rawStats: RawStats[], currentScore: number) =>
  rawStats.reduce(
    (acc: Statistics, stat: RawStats) => {
      if (stat.score > 0 && stat.score <= currentScore) {
        acc.firstQuartile += stat.count;
      } else {
        acc.lastQuartile += stat.count;
      }
      return acc;
    },
    {
      firstQuartile: 0,
      lastQuartile: 0,
    }
  );

const endpoint =
  process.env.NODE_ENV === "production"
    ? "https://stats.archiguesser.com/result"
    : "http://localhost:8080/result";

export const sendResult = async (
  dayNumber: number,
  score: number,
  guesses: string[],
  stats: StatsObject
): Promise<number | undefined> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { firstPlayed, lastPlayed, ...dailyStats } = stats;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        day: dayNumber,
        score,
        start_day: firstPlayed,
        guesses,
        stats_days: Object.keys(dailyStats).map((day) => parseInt(day)),
        stats_scores: Object.values(dailyStats),
      }),
    });

    if (score === 0) {
      return undefined;
    }

    const stats = await response.json();

    const { firstQuartile, lastQuartile } = calculateQuartiles(stats, score);

    return Math.trunc((firstQuartile / (firstQuartile + lastQuartile)) * 100);
  } catch (error) {
    return undefined;
  }
};
