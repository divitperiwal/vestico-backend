export const getMiraeTokenExpiry = () => {
  const now = new Date();

  const expiry = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return expiry;
};

export const calculateTimeToExpiry = (expiry: Date) => {
  const now = Date.now();
  const diffMs = expiry.getTime() - now;
  const timeDifference = Math.max(0, Math.floor(diffMs / 1000));

  return timeDifference;
};

calculateTimeToExpiry(new Date('2025-12-21T13:13:00Z'));
