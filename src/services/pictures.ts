import pictureFolders from "virtual:picture-folders";

// Replayed days reuse the pictures of the day they replay
export const pictureFolder = (dayNumber: number): number =>
  pictureFolders[dayNumber] ?? dayNumber;
