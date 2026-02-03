export const getMiraeTokenExpiry = () => {
  const now = new Date();

  // Get current time in IST
  const istTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  // Set to 11:59:59 PM IST
  istTime.setHours(23, 59, 59, 999);

  return istTime;
}

export const calculateTimeToExpiry = (expiry: Date) => {
  const now = Date.now();
  const diffMs = expiry.getTime() - now;
  const timeDifference = Math.max(0, Math.floor(diffMs / 1000));

  return timeDifference;
};
