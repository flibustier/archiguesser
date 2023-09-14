import { signIn } from "./api";
import {
  getChallenges,
  getCredentials,
  getStats,
  isLogged,
  overrideChallenges,
  overrideStats,
} from "./store";

interface UserData {
  stats: string;
  challenges: string;
  start_day?: number;
  last_day?: number;
}
export const storeStatsAndChallenges = (userData: UserData) => {
  if (userData.stats) {
    overrideStats(userData.stats, {
      firstPlayed: userData.start_day,
      lastPlayed: userData.last_day,
    });
  }
  if (userData.challenges) {
    overrideChallenges(userData.challenges);
  }
};

export const syncUser = async (): Promise<void> => {
  if (isLogged()) {
    const { email, password } = getCredentials();
    const userData = await signIn(email, password, getStats(), getChallenges());
    storeStatsAndChallenges(userData);
  }
};
