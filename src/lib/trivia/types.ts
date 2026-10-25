// Shared types for the trivia API — used by both the client and the server

export type TriviaQuestion = {
  question: string;
  options: string[];
  correctOptionIndex: number;
};

export type TriviaRequest = {
  // null means "general trivia question"
  topic: string | null;
  recentQuestions: string[];
};

export type ApiErrorCode = "QUESTION_UNAVAILABLE" | "TOPIC_NOT_ALLOWED";

export type ApiErrorBody = {
  error: { code: ApiErrorCode; message: string };
};
