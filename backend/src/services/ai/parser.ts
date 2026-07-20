import { EvaluationResponse } from './providers/aiProvider.interface';

export const parser = {
  /**
   * Cleans raw LLM text by stripping markdown code blocks and extracting JSON string.
   */
  cleanRawResponse(rawResponse: string): string {
    if (!rawResponse || typeof rawResponse !== 'string') {
      throw new Error('AI Provider returned an empty or invalid response string.');
    }

    // 1. Strip markdown code fences (e.g. ```json ... ``` or ``` ...)
    let cleaned = rawResponse
      .replace(/^```(?:json)?\s*/gi, '')
      .replace(/\s*```$/gi, '')
      .trim();

    // 2. Extract JSON substring bounded by first '{' and last '}'
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    return cleaned;
  },

  /**
   * Cleans and parses LLM outputs, matching json codeblocks if wrapped.
   */
  parseJSONResponse(response: string): any {
    try {
      const cleaned = this.cleanRawResponse(response);
      return JSON.parse(cleaned);
    } catch (err: any) {
      console.error('Failed to parse AI JSON response:', err);
      throw new Error(`Invalid JSON response format from AI provider: ${err.message}`);
    }
  },

  /**
   * Parses and strictly validates LLM response against EvaluationResponse interface.
   * Returns structured errors if any required field is missing or invalid.
   */
  parseAndValidateEvaluationResponse(rawResponse: string): EvaluationResponse {
    const data = this.parseJSONResponse(rawResponse);

    const errors: string[] = [];

    // Helper score check
    const validateScoreField = (fieldName: string, value: any) => {
      if (typeof value !== 'number' || isNaN(value) || value < 0 || value > 100) {
        errors.push(`Field '${fieldName}' must be a number between 0 and 100 (got: ${value})`);
      }
    };

    validateScoreField('overallScore', data.overallScore);
    validateScoreField('accuracyScore', data.accuracyScore);
    validateScoreField('communicationScore', data.communicationScore);
    validateScoreField('completenessScore', data.completenessScore);

    if (!Array.isArray(data.strengths)) {
      errors.push("Field 'strengths' must be an array of strings.");
    } else if (data.strengths.some((item: any) => typeof item !== 'string')) {
      errors.push("Field 'strengths' must contain only strings.");
    }

    if (!Array.isArray(data.weaknesses)) {
      errors.push("Field 'weaknesses' must be an array of strings.");
    } else if (data.weaknesses.some((item: any) => typeof item !== 'string')) {
      errors.push("Field 'weaknesses' must contain only strings.");
    }

    if (!Array.isArray(data.suggestions) || data.suggestions.length === 0) {
      errors.push("Field 'suggestions' must be a non-empty array.");
    } else {
      data.suggestions.forEach((sugg: any, index: number) => {
        if (!sugg || typeof sugg !== 'object') {
          errors.push(`Suggestion at index ${index} is not an object.`);
          return;
        }

        if (!sugg.questionId || typeof sugg.questionId !== 'string') {
          errors.push(`Suggestion at index ${index} is missing a valid 'questionId'.`);
        }
        if (typeof sugg.questionText !== 'string') {
          errors.push(`Suggestion at index ${index} is missing 'questionText'.`);
        }
        if (typeof sugg.userAnswer !== 'string') {
          errors.push(`Suggestion at index ${index} is missing 'userAnswer'.`);
        }
        if (typeof sugg.modelAnswer !== 'string') {
          errors.push(`Suggestion at index ${index} is missing 'modelAnswer'.`);
        }
        if (typeof sugg.feedbackText !== 'string') {
          errors.push(`Suggestion at index ${index} is missing 'feedbackText'.`);
        }
        validateScoreField(`suggestions[${index}].score`, sugg.score);
      });
    }

    if (errors.length > 0) {
      const errorMessage = `AI Evaluation Response Schema Validation Failed:\n- ${errors.join('\n- ')}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    return {
      overallScore: Math.round(data.overallScore),
      accuracyScore: Math.round(data.accuracyScore),
      communicationScore: Math.round(data.communicationScore),
      completenessScore: Math.round(data.completenessScore),
      strengths: data.strengths,
      weaknesses: data.weaknesses,
      suggestions: data.suggestions.map((sugg: any) => ({
        questionId: String(sugg.questionId),
        questionText: String(sugg.questionText || ''),
        userAnswer: String(sugg.userAnswer || ''),
        modelAnswer: String(sugg.modelAnswer || ''),
        feedbackText: String(sugg.feedbackText || ''),
        score: Math.round(sugg.score)
      }))
    };
  }
};
