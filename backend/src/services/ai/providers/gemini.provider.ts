import { GoogleGenAI } from '@google/genai';
import { IAIProvider, EvaluationRequest, EvaluationResponse } from './aiProvider.interface';
import { promptBuilder } from '../promptBuilder';
import { parser } from '../parser';

export class GeminiProvider implements IAIProvider {
  private getApiKey(): string {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    return apiKey;
  }

  private getModelName(): string {
    return process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  }

  async evaluateSession(request: EvaluationRequest): Promise<EvaluationResponse> {
    const apiKey = this.getApiKey();
    const model = this.getModelName();

    const prompt = promptBuilder.buildEvaluationPrompt(request);

    const ai = new GoogleGenAI({ apiKey });

    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Gemini API returned an empty text response.');
      }

      const evaluation = parser.parseAndValidateEvaluationResponse(responseText);
      return evaluation;
    } catch (err: any) {
      console.error(`Gemini evaluation error with model '${model}':`, err);
      throw new Error(`Gemini AI Provider evaluation failed: ${err.message || err}`);
    }
  }
}
