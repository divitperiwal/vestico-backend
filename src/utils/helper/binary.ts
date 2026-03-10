export function decodeQuotePacket(buffer: Buffer) {

    const quote: any = {};

    quote.token = buffer.readUInt32BE(0);

    quote.ltp = buffer.readInt32BE(4) / 100;
    quote.lastTradedQty = buffer.readInt32BE(8);
    quote.avgTradedPrice = buffer.readInt32BE(12) / 100;
    quote.volume = buffer.readInt32BE(16);

    quote.totalBuyQty = buffer.readInt32BE(20);
    quote.totalSellQty = buffer.readInt32BE(24);

    quote.open = buffer.readInt32BE(28) / 100;
    quote.high = buffer.readInt32BE(32) / 100;
    quote.low = buffer.readInt32BE(36) / 100;
    quote.close = buffer.readInt32BE(40) / 100;

    quote.lastTradeTime = buffer.readInt32BE(44);

    quote.oi = buffer.readInt32BE(48);
    quote.oiHigh = buffer.readInt32BE(52);
    quote.oiLow = buffer.readInt32BE(56);

    quote.exchangeTimestamp = buffer.readInt32BE(60);

    quote.marketDepth = { bids: [], asks: [] };

    let offset = 64;

    for (let i = 0; i < 5; i++) {

        const qty = buffer.readInt32BE(offset);
        const price = buffer.readInt32BE(offset + 4) / 100;
        const orders = buffer.readInt16BE(offset + 8);

        quote.marketDepth.bids.push({ qty, price, orders });

        offset += 12;
    }

    for (let i = 0; i < 5; i++) {

        const qty = buffer.readInt32BE(offset);
        const price = buffer.readInt32BE(offset + 4) / 100;
        const orders = buffer.readInt16BE(offset + 8);

        quote.marketDepth.asks.push({ qty, price, orders });

        offset += 12;
    }

    quote.upperCircuit = buffer.readInt32BE(184) / 100;
    quote.lowerCircuit = buffer.readInt32BE(188) / 100;
    quote.yearHigh = buffer.readInt32BE(192) / 100;
    quote.yearLow = buffer.readInt32BE(196) / 100;

    return quote;
}

let streamBuffer = Buffer.alloc(0);

export function decodePackets(data: Buffer) {
    const packets: Buffer[] = [];

    // accumulate frames
    streamBuffer = Buffer.concat([streamBuffer, data]);

    // must have at least header
    if (streamBuffer.length < 4) return packets;

    const packetCount = streamBuffer.readUInt16BE(0);

    let offset = 2;

    for (let i = 0; i < packetCount; i++) {

        // need packet size
        if (offset + 2 > streamBuffer.length) break;

        const packetSize = streamBuffer.readUInt16BE(offset);
        offset += 2;

        // wait for full packet
        if (offset + packetSize > streamBuffer.length) {
            offset -= 2; // rewind so next frame re-reads size
            break;
        }

        packets.push(streamBuffer.slice(offset, offset + packetSize));

        offset += packetSize;
    }

    // remove consumed bytes
    streamBuffer = streamBuffer.slice(offset);

    return packets;
}