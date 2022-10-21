export const sendEvent = (event: string) => {
  if (process.env.NODE_ENV === "production") {
    try {
      cabin.event(event);
    } catch (e) {
      console.log(e);
    }
  }
};
