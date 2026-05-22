import { CUSTOM_INSTRUMENTS } from "@/constant";
import type { Instrument } from "@/types/common.js";

export function parseInstruments(csv: string) {
    const rows = csv.split("\n");
    const instruments: Instrument[] = [];

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row) continue;

        const cols = row.split(",");

        if (cols[11] !== "NSE" || cols[9] !== "EQ") continue;

        const instrument: Instrument = {
            token: Number(cols[0]),
            ticker: cols[2]!,
            name: cols[3]!
        };

        instruments.push(instrument);
    }

    return [...instruments, ...CUSTOM_INSTRUMENTS];
}