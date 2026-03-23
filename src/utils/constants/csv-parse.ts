import { InstrumentCache } from "@/cache/instrument.cache.js";
import { CUSTOM_INSTRUMENTS } from "@/utils/constants/indices.constant.js";
import type { Instrument } from "@/types/common.js";

export function parseInstruments(csv: string) {
    const rows = csv.split("\n");

    const newTokenMap = new Map<number, Instrument>()
    const newTickerMap = new Map<string, Instrument>()

    for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].split(",");

        if (cols[11] !== "NSE" || cols[9] !== "EQ") continue;

        const instrument: Instrument = {
            token: Number(cols[0]),
            ticker: cols[2],
            name: cols[3]
        };

        newTokenMap.set(instrument.token, instrument);
        newTickerMap.set(instrument.ticker, instrument);
    }
    for (const instrument of CUSTOM_INSTRUMENTS) {

        newTokenMap.set(instrument.token, instrument)
        newTickerMap.set(instrument.ticker, instrument)

    }
    InstrumentCache.replace(newTokenMap, newTickerMap);
    return true;
}