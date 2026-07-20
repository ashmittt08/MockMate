import { IAIProvider } from './aiProvider.interface';
import { MockAIProvider } from './mockProvider';
import { GeminiProvider } from './gemini.provider';

export class AIProviderFactory {
  /**
   * Returns the configured AI provider based on environment settings or name parameter.
   */
  static getProvider(name: string = process.env.AI_PROVIDER || 'mock'): IAIProvider {
    switch (name.toLowerCase()) {
      case 'gemini':
        return new GeminiProvider();
      case 'mock':
      default:
        return new MockAIProvider();
    }
  }
}
