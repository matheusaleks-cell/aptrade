"use server";

let cachedRate: { value: number; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

export async function getUsdBrlRate(): Promise<number> {
  if (cachedRate && Date.now() - cachedRate.timestamp < CACHE_TTL) {
    return cachedRate.value;
  }

  try {
    const res = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL", {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    const rate = parseFloat(data.USDBRL.bid);
    cachedRate = { value: rate, timestamp: Date.now() };
    return rate;
  } catch {
    return cachedRate?.value ?? 5.65;
  }
}
