export const parser = {
  /**
   * Cleans and parses LLM outputs, matching json codeblocks if wrapped.
   */
  parseJSONResponse(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : response;
      return JSON.parse(jsonStr);
    } catch (err) {
      console.error('Failed to parse AI JSON response:', err);
      throw new Error('Invalid JSON response format from AI provider.');
    }
  }
};
