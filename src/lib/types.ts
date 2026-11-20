export type Category = "WORK" | "ACADEMIC" | "DAILY";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type PracticeStatus = "ACTIVE" | "PAUSED" | "CLOSING" | "COMPLETED";
export interface Page<T> { items: T[]; nextCursor: string | null }
export interface Scenario {
  id: string; versionId: string; version: number; title: string; category: Category;
  description: string; aiRole: string; objective: string; initiator: "USER" | "ASSISTANT";
  estimatedMinMinutes: number | null; estimatedMaxMinutes: number | null;
  contextFields: { key: string; label: string; defaultValue: string }[];
  startInstruction: string | null;
}
export interface Reply {
  id: string; status: "PENDING" | "PROCESSING" | "READY" | "FAILED"; errorCode: string | null;
}
export interface Practice {
  id: string; scenarioId: string; scenarioTitle: string; category: Category; aiRole: string;
  difficulty: Difficulty; provider: "SIMULATED" | "OPENAI"; status: PracticeStatus;
  customContext: Record<string, string>; userMessageCount: number; messageCount: number;
  remainingUserMessages: number; limitWarning: boolean; practiceDurationSeconds: number;
  feedbackStatus: string; latestReply: Reply | null;
  startedAt: string; pausedAt: string | null; finishedAt: string | null;
  pauseReason: string | null; finishReason: string | null;
}
export interface Message {
  id: string; role: "USER" | "ASSISTANT"; content: string; sequence: number;
  clientMessageId?: string | null; createdAt: string;
}
export interface PracticeResult { practice: Practice; feedback: null; notice: string }
export interface CreatePractice {
  clientRequestId: string; scenarioId: string; difficulty: Difficulty; customContext: Record<string, string>;
}
