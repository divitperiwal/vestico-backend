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
