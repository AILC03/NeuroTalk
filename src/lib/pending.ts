// Solo memoria: nunca persistir conversaciones en localStorage/AsyncStorage.
export const uncertainSends = new Map<string, { clientMessageId: string; content: string }>();
export function clearPendingSends() { uncertainSends.clear(); }
