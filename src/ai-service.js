export class AIService {
    constructor() {
      // Directly use Gemini endpoint with API key
      this.apiKey = 'AIzaSyB3s5bGouq8TdmOcHiMZ84f_tbc9xwkbkg'; // Replace with your actual API key
      this.baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;
    }
  
    async generateBattlePrompt() {
      const promptText = `Generate a kid friendly ages 5-6 years old not offensive, make the answer obvious, don't add number in the generated choices, unique not repetitive verb battle line with missing word in this exact format no need for additional words just the format:
      Example
      "The warriors need _____ to lead them to victory."
      Then provide exactly 3 numbered options where the first is clearly the best.
      Example:
      Without _____, the castle is in danger!
      1. defense
      2. car
      3. candy`;
  
      try {
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: promptText }]
            }]
          })
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'API request failed');
        }
  
        return await response.json();
  
      } catch (error) {
        console.error('AI request failed:', error);
        // Return structured fallback data
        return {
          candidates: [{
            content: {
              parts: [{
                text: "Without _____, the castle is in danger!\n1. defense\n2. car\n3. candy"
              }]
            }
          }]
        };
      }
    }
  }