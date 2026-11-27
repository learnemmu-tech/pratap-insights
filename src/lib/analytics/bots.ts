const BOT_PATTERN =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegrambot|headless|lighthouse|pingdom|monitor/i;

export function isLikelyBot(userAgent: string | null | undefined) {
  if (!userAgent) return true;
  if (userAgent.length < 12) return true;
  return BOT_PATTERN.test(userAgent);
}

export function isEngagedRead(input: { durationSeconds?: number; scrollDepth?: number }) {
  return (input.durationSeconds ?? 0) >= 30 || (input.scrollDepth ?? 0) >= 50;
}
