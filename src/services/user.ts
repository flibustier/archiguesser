import { signIn } from "@/api";
import { getChallenges, getCredentials, getStats, isLogged } from "@/store";

export const syncUser = async (): Promise<void> => {
  if (isLogged()) {
    const { email, password } = getCredentials();
    const currentStats = getStats();
    const currentChallenges = getChallenges();
    const { stats, challenges, start_day, last_day } = await signIn(
      email,
      password,
      currentStats,
      currentChallenges,
    );
    if (stats) {
      localStorage.setItem(
        "stats",
        JSON.stringify({
          ...JSON.parse(stats),
          firstPlayed: start_day || currentStats.firstPlayed,
          lastPlayed: last_day || currentStats.lastPlayed,
        }),
      );
    }
    if (challenges) {
      localStorage.setItem(
        "challenges",
        JSON.stringify({
          ...JSON.parse(challenges),
          dayNumber: currentChallenges.dayNumber,
          retryCount: currentChallenges.retryCount,
        }),
      );
    }
  }
};
