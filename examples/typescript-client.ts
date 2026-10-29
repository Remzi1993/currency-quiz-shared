import createClient from "openapi-fetch";
import type { components, paths } from "../generated/typescript/schema";

// The Vue app supplies its backend origin, for example from VITE_API_BASE_URL.
export const createQuizClient = (baseUrl: string) => createClient<paths>({ baseUrl });
export type PublicQuestion = components["schemas"]["PublicQuestion"];
export type QuestionPatch = components["schemas"]["UpdateQuestionRequest"];

export async function playExample(baseUrl: string): Promise<boolean | undefined> {
  const api = createQuizClient(baseUrl);
  const { data: questions, error } = await api.GET("/api/v1/questions");
  if (error) throw new Error(error.message);
  const question = questions?.[0];
  if (!question) return;

  // Public responses cannot supply the solution to the browser.
  // @ts-expect-error correctAnswer belongs to AdminQuestion, not PublicQuestion.
  question.correctAnswer;

  const answer = question.options[0];
  if (!answer) return;
  const result = await api.POST("/api/v1/questions/{id}/answers", {
    params: { path: { id: question.id } },
    body: { answer },
  });
  if (result.error) throw new Error(result.error.message);
  return result.data.correct;
}
