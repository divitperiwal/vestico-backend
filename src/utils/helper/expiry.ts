export const getMiraeTokenExpiry = () => {
  const now = new Date();

  const utcEndOfDay = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23, // 11 PM
      59, // 59 minutes
      59, // 59 seconds
      999, // 999 milliseconds
    ),
  );

  return utcEndOfDay;
};

export const calculateTimeToExpiry = (expiry: Date) => {
  const now = Date.now();
  const diffMs = expiry.getTime() - now;
  const timeDifference = Math.max(0, Math.floor(diffMs / 1000));

  return timeDifference;
};

export const getSecondsUntilMarketOpen = () => {
  const now = new Date();

  const marketOpen = new Date();
  marketOpen.setHours(9, 15, 0, 0);

  if (now > marketOpen) {
    marketOpen.setDate(marketOpen.getDate() + 1);
  }

  return Math.floor((marketOpen.getTime() - now.getTime()) / 1000);
}

export function getNextMarketChangeTTL(): number {
  const now = new Date();

  const ist = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  const openMinutes = 9 * 60 + 15;  // 09:15
  const closeMinutes = 15 * 60 + 30; // 15:30

  const currentMinutes = ist.getHours() * 60 + ist.getMinutes();

  let target = new Date(ist);

  if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
    // Market open → expire at 15:30
    target.setHours(15, 30, 0, 0);
  } else {
    // Market closed → expire at next 09:15
    target.setDate(target.getDate() + (currentMinutes >= closeMinutes ? 1 : 0));
    target.setHours(9, 15, 0, 0);
  }

  return Math.floor((target.getTime() - ist.getTime()) / 1000);
}