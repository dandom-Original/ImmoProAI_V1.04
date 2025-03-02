import { openrouter } from '../lib/openrouter';

export class AIService {
  private static defaultModel = 'anthropic/claude-3-opus:beta';
  private static defaultTemperature = 0.7;
  private static defaultMaxTokens = 2000;

  static async generateClientProfile(description: string) {
    const prompt = `
      Based on the following client description, generate a structured client profile for a real estate matching system.
      Include name, company (if applicable), client type, preferences (location, property type, budget range, etc.), and suggested tags.
      
      Client Description:
      ${description}
      
      Return the result as a JSON object with the following structure:
      {
        "name": "Client name",
        "company": "Company name if applicable",
        "type": "Private investor/Family office/Institutional investor/etc.",
        "preferences": {
          "location": ["Area1", "Area2"],
          "propertyType": ["Type1", "Type2"],
          "budget": "Range in EUR",
          "size": "Range in sqm",
          "additionalRequirements": ["Req1", "Req2"]
        },
        "suggestedTags": ["Tag1", "Tag2", "Tag3"]
      }
    `;

    try {
      const response = await openrouter.createCompletion({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: 'You are an expert real estate analyst assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: this.defaultTemperature,
        max_tokens: this.defaultMaxTokens
      });

      const content = response.choices[0].message.content;
      
      // Extract JSON from the response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/```\n([\s\S]*?)\n```/) || 
                        content.match(/{[\s\S]*?}/);
      
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } catch (e) {
          console.error('Failed to parse JSON from AI response:', e);
          throw new Error('Failed to parse AI response');
        }
      } else {
        throw new Error('No valid JSON found in AI response');
      }
    } catch (error) {
      console.error('Error in generateClientProfile:', error);
      throw error;
    }
  }

  static async analyzeProperty(propertyData: any) {
    const prompt = `
      Analyze the following property data and provide insights:
      ${JSON.stringify(propertyData, null, 2)}
      
      Return a JSON object with:
      {
        "summary": "Brief property summary",
        "strengths": ["Strength1", "Strength2"],
        "weaknesses": ["Weakness1", "Weakness2"],
        "potentialBuyers": ["Buyer profile 1", "Buyer profile 2"],
        "suggestedTags": ["Tag1", "Tag2", "Tag3"],
        "estimatedValue": "Value range in EUR"
      }
    `;

    try {
      const response = await openrouter.createCompletion({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: 'You are an expert real estate analyst assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: this.defaultTemperature,
        max_tokens: this.defaultMaxTokens
      });

      const content = response.choices[0].message.content;
      
      // Extract JSON from the response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/```\n([\s\S]*?)\n```/) || 
                        content.match(/{[\s\S]*?}/);
      
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } catch (e) {
          console.error('Failed to parse JSON from AI response:', e);
          throw new Error('Failed to parse AI response');
        }
      } else {
        throw new Error('No valid JSON found in AI response');
      }
    } catch (error) {
      console.error('Error in analyzeProperty:', error);
      throw error;
    }
  }

  static async findMatches(clientProfile: any, properties: any[]) {
    const prompt = `
      Find the best matches between this client profile and the available properties:
      
      Client Profile:
      ${JSON.stringify(clientProfile, null, 2)}
      
      Available Properties:
      ${JSON.stringify(properties, null, 2)}
      
      Return a JSON array of matches with the following structure:
      [
        {
          "propertyId": "ID of the property",
          "matchScore": 85, // 0-100 score
          "matchReasons": ["Reason1", "Reason2"],
          "concerns": ["Concern1", "Concern2"]
        }
      ]
      
      Sort the results by matchScore in descending order.
    `;

    try {
      const response = await openrouter.createCompletion({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: 'You are an expert real estate matching assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: this.defaultTemperature,
        max_tokens: this.defaultMaxTokens
      });

      const content = response.choices[0].message.content;
      
      // Extract JSON from the response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/```\n([\s\S]*?)\n```/) || 
                        content.match(/\[[\s\S]*?\]/);
      
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } catch (e) {
          console.error('Failed to parse JSON from AI response:', e);
          throw new Error('Failed to parse AI response');
        }
      } else {
        throw new Error('No valid JSON found in AI response');
      }
    } catch (error) {
      console.error('Error in findMatches:', error);
      throw error;
    }
  }

  static setModel(model: string) {
    this.defaultModel = model;
  }

  static getModel() {
    return this.defaultModel;
  }
}
