/**
 * Generated from openapi/currency-quiz.v1.yaml using OpenAPI Generator.
 * Do not edit directly; run npm run generate.
 */

/**
 * Question returned only by authenticated administration operations.
 * @export
 * @interface AdminQuestion
 */
export interface AdminQuestion {
    /**
     *
     */
    id: string;
    /**
     *
     */
    text: string;
    /**
     * Stored options are trimmed and unique when compared without case.
     */
    options: Array<string>;
    /**
     * Stored correct answer. Matches one of the stored options.
     */
    correctAnswer: string;
}
/**
 *
 * @export
 * @interface AnswerRequest
 */
export interface AnswerRequest {
    /**
     * After trimming, must contain 1 to 200 UTF-16 code units. Does not have to match a listed option.
     */
    answer: string;
}
/**
 *
 * @export
 * @interface AnswerResponse
 */
export interface AnswerResponse {
    /**
     *
     */
    correct: boolean;
}
/**
 *
 * @export
 * @interface ApiError
 */
export interface ApiError {
    /**
     *
     */
    code: string;
    /**
     *
     */
    message: string;
    /**
     * Validation reasons; an empty array when no additional details are available.
     */
    details: Array<string>;
}
/**
 *
 * @export
 * @interface CreateQuestionRequest
 */
export interface CreateQuestionRequest {
    /**
     * After trimming, must contain 1 to 500 UTF-16 code units.
     */
    text: string;
    /**
     * Must also be unique after trimming and comparing without case.
     */
    options: Array<string>;
    /**
     * After trimming, must contain 1 to 200 UTF-16 code units and match an option without case.
     */
    correctAnswer: string;
}
/**
 *
 * @export
 * @interface LoginRequest
 */
export interface LoginRequest {
    /**
     *
     */
    username: string;
    /**
     *
     */
    password: string;
}
/**
 * Public question data. Correct answers are never included.
 * @export
 * @interface PublicQuestion
 */
export interface PublicQuestion {
    /**
     *
     */
    id: string;
    /**
     *
     */
    text: string;
    /**
     * Stored options are trimmed and unique when compared without case.
     */
    options: Array<string>;
}
/**
 *
 * @export
 * @interface TokenResponse
 */
export interface TokenResponse {
    /**
     *
     */
    accessToken: string;
    /**
     *
     */
    tokenType: TokenResponseTokenTypeEnum;
    /**
     * Token lifetime in seconds.
     */
    expiresIn: number;
}
/**
 * @export
 */
export type TokenResponseTokenTypeEnum = 'Bearer';
/**
 * At least one field must have a non-null value; the resulting question must be valid.
 * @export
 * @interface UpdateQuestionRequest
 */
export interface UpdateQuestionRequest {
    /**
     * Null retains the existing value. Otherwise, trim and require 1 to 500 UTF-16 code units.
     */
    text?: string | null;
    /**
     * Null retains the existing options. Otherwise, options must be unique after trimming and comparing without case.
     */
    options?: Array<string> | null;
    /**
     * Null retains the existing value. Otherwise, trim and require 1 to 200 UTF-16 code units matching a resulting option without case.
     */
    correctAnswer?: string | null;
}
/**
 *
 * @export
 * @interface UpdateQuestionRequestNot
 */
export interface UpdateQuestionRequestNot {
    /**
     *
     */
    text?: UpdateQuestionRequestNotTextEnum | null;
    /**
     *
     */
    options?: UpdateQuestionRequestNotOptionsEnum | null;
    /**
     *
     */
    correctAnswer?: UpdateQuestionRequestNotCorrectAnswerEnum | null;
}
/**
 * @export
 */
export type UpdateQuestionRequestNotTextEnum = never;
/**
 * @export
 */
export type UpdateQuestionRequestNotOptionsEnum = never;
/**
 * @export
 */
export type UpdateQuestionRequestNotCorrectAnswerEnum = never;
