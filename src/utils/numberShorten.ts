export function numberShorten(number: number) {
  if (number > 1000 && number < 10000) {
    return (number / 1000).toFixed(2) + 'K';
  }
  if (number > 10000 && number < 100000) {
    return (number / 1000).toFixed(1) + 'K';
  }
  if (number > 100000) {
    return (number / 1000).toFixed(0) + 'K';
  }
  if (number > 1000000) {
    return (number / 1000000).toFixed(2) + 'M';
  }
  return number.toString();
}
