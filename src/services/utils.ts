export const shuffle = <T>(array: T[]): T[] => {
  let randIndex;
  let currIndex = array.length;

  while (currIndex != 0) {
    randIndex = Math.floor(Math.random() * currIndex);
    currIndex--;

    [array[currIndex], array[randIndex]] = [array[randIndex], array[currIndex]];
  }

  return array;
};
