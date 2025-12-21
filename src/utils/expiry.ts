export const getMiraeTokenExpiry = () => {
  const now = new Date();

  const expiry = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,59,59,999
  )
  return expiry;
};
