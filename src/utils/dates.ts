export const fmtTimeSpan = (date: number): string => {
  const measures = [60, 60, 24, 52];
  const units = ["minutes", "hours", "days", "weeks"];
  let measureIdx = 0;

  let duration = (new Date().getTime() - date) / (1000 * 60);

  while (measureIdx < 4) {
    const m = measures[measureIdx];
    if (duration >= m) duration /= m;
    else return `${Math.floor(duration)} ${units[measureIdx]}`;
    measureIdx++;
  }
  return `${Math.floor(duration)} years`;
};
