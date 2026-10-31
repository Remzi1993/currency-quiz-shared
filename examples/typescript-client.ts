import type {
  AnswerRequest,
  AnswerResponse,
  PublicQuestion,
  UpdateQuestionRequest,
} from "@currency-quiz/contract";

export type { PublicQuestion };
export type QuestionPatch = UpdateQuestionRequest;

// The Vue app supplies its backend origin, for example from VITE_API_BASE_URL.
// These annotations describe the expected JSON; they do not validate it at runtime.
export async function playExample(baseUrl: string): Promise<boolean | undefined> {
  const response = await fetch(new URL("/api/v1/questions", baseUrl));
  if (!response.ok) throw new Error(`Loading questions failed: ${response.status}`);
  const questions: PublicQuestion[] = await response.json();
  const question = questions[0];
  if (!question) return;

  const answer = question.options[0];
  if (!answer) return;
  const body: AnswerRequest = { answer };
  const result = await fetch(new URL(`/api/v1/questions/${encodeURIComponent(question.id)}/answers`, baseUrl), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!result.ok) throw new Error(`Submitting an answer failed: ${result.status}`);
  const data: AnswerResponse = await result.json();
  return data.correct;
}
