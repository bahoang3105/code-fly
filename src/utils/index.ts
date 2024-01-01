export const randomInt = (a: number, b: number) => {
  return Math.floor(Math.random() * (b - (a + 1)) + a + 1);
};
