export function isMarketOpen() {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const day = now.getDay();
    if (day === 0 || day === 6) return false;

    const open = new Date(); open.setHours(9, 14, 0, 0);
    const close = new Date(); close.setHours(15, 30, 0, 0);
    return now >= open && now <= close;
}