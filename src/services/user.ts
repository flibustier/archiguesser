import type { UserData } from "./api.ts";
import { signIn } from "./api.ts";
import {
  getChallenges,
  getCredentials,
  getStats,
  isLogged,
  overrideChallenges,
  overrideStats,
} from "./store.ts";

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
