// Results that could not be sent (offline, server down) wait here and are
// sent again later. Only the game itself is kept: the account and the stats
// are read again when sending.

export interface PendingResult {
  day: number;
  score: number;
  guesses: string[];
}

const KEY = "pendingResults";
const MAX_PENDING = 30;

const read = (): PendingResult[] => {
  try {
    const pending = JSON.parse(localStorage.getItem(KEY) || "[]");

    return Array.isArray(pending) ? pending : [];
  } catch {
    return [];
  }
};

const write = (pending: PendingResult[]) => {
  if (pending.length === 0) {
    localStorage.removeItem(KEY);
  } else {
    localStorage.setItem(KEY, JSON.stringify(pending.slice(-MAX_PENDING)));
  }
};

export const getPendingResults = read;

export const keepForLater = (result: PendingResult) =>
  write([...read().filter(({ day }) => day !== result.day), result]);

// "send" answers true when the server received the result (whatever it
// thought of it), false when it could not be reached.
export const flushPendingResults = async (
  send: (result: PendingResult) => Promise<boolean>,
): Promise<number> => {
  let sent = 0;
  for (const result of read()) {
    if (!(await send(result))) {
      break; // still offline: keep the rest for next time
    }
    write(read().filter(({ day }) => day !== result.day));
    sent++;
  }

  return sent;
};
