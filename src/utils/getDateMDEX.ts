export function getDateMDEX() {
  const date = new Date();
  function pad(n: number) {
    return n < 10 ? '0' + n : n;
  }
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth())}-${pad(
    date.getUTCDate(),
  )}T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(
    date.getUTCSeconds(),
  )}`;
}

// ^\d{4}-[0-1]\d-([0-2]\d|3[0-1])T([0-1]\d|2[0-3]):[0-5]\d:[0-5]\d$
