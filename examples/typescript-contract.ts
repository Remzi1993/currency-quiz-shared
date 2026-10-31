// Compile-only checks for contract guarantees used by the frontend.
import type {
  AdminQuestion,
  ApiError,
  PublicQuestion,
  TokenResponse,
  UpdateQuestionRequest,
} from "@currency-quiz/contract";

declare const question: PublicQuestion;
declare const admin: AdminQuestion;
declare const error: ApiError;
declare const runtime: typeof import("@currency-quiz/contract");

// @ts-expect-error The schema package must not advertise runtime enum objects.
runtime.TokenResponseTokenTypeEnum;

// uniqueItems describes a JSON array, not a JavaScript Set.
question.options satisfies string[];
admin.correctAnswer satisfies string;
error.details satisfies string[];

// @ts-expect-error Public questions must not expose the correct answer.
question.correctAnswer;

// @ts-expect-error Admin questions require a correct answer.
({ id: "id", text: "Question?", options: ["EUR", "USD"] }) satisfies AdminQuestion;

({ text: null, options: ["EUR", "USD"], correctAnswer: null }) satisfies UpdateQuestionRequest;
({ text: "New text", options: null }) satisfies UpdateQuestionRequest;
({ text: "New text" }) satisfies UpdateQuestionRequest;
({ options: ["EUR", "USD"] }) satisfies UpdateQuestionRequest;

// @ts-expect-error PATCH options must still be arrays when non-null.
({ options: "EUR" }) satisfies UpdateQuestionRequest;

// @ts-expect-error Extra request fields are not part of the closed schema.
({ unexpected: true }) satisfies UpdateQuestionRequest;

// @ts-expect-error Token type must be the literal Bearer.
"Basic" satisfies TokenResponse["tokenType"];
"Bearer" satisfies TokenResponse["tokenType"];

// @ts-expect-error Error details must be present, even when empty.
({ code: "validation_error", message: "Invalid request" }) satisfies ApiError;
