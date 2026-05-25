export const classifyAssetType = (isin: string) => {
    if (isin.startsWith('INE')) return 'stock';
    if (isin.startsWith('INF')) return 'etf';
    return null;
}