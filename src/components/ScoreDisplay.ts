export const displayScoreHTML = (score: number) => {
  const redSquares = `<span class="square red">🟥</span>`.repeat(
    score === 0 ? 6 : score - 1
  );
  const blackSquares = `<span class="square black">⬛</span>`.repeat(
    score === 0 ? 0 : 6 - score
  );
  const midSquare = score > 0 ? `<span class="square green">🟩</span>` : "";

  return redSquares + midSquare + blackSquares;
};
