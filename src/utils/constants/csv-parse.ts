import { InstrumentCache } from "@/cache/instrument.cache.js";

export function parseInstruments(csv: string) {
    const rows = csv.split("\n");

    for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].split(",");

        if (cols[11] !== "NSE" || cols[9] !== "EQ") continue;

        InstrumentCache.set({
            token: Number(cols[0]),
            ticker: cols[2],
            name: cols[3]
        })
    }

    return true;
}