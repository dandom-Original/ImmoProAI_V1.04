import { openrouter } from '../lib/openrouter';

export class OpenRouterService {
  static async listModels() {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'ImmoMatch Pro'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching OpenRouter models:', error);
      throw error;
    }
  }

  static async testConnection() {
    try {
      const response = await openrouter.createCompletion({
        model: 'anthropic/claude-instant-v1',
        messages: [
          { role: 'user', content: 'Hello, are you working?' }
        ],
        max_tokens: 10
      });
      
      return {
        success: true,
        message: response.choices[0].message.content
      };
    } catch (error) {
      console.error('OpenRouter connection test failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
