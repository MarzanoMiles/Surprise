export class AIService {
  constructor() {
    // Directly use Gemini endpoint with API key
    this.apiKey = 'AIzaSyB3s5bGouq8TdmOcHiMZ84f_tbc9xwkbkg'; // Replace with your actual API key
    this.baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;
  }

  async generateBattlePrompt() {
    const promptText = `Generate a battle line with missing word and explore the "examples", dont add the numbers in the choices. no need for additional words just the format:
      Example
      "You’re like the word 'very' — always there, but rarely _____"
      Then provide exactly 3 numbered options where the first is clearly the best.
      Examples:
      You’re like the word 'very' — always there, but rarely _____
      1. needed
      2. strong
      3. correct
      
      You're like all caps in a text — coming off a little too _____."
      1. loud
      2. angry
      3. formal`;

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
              text: "You're like a misplaced modifier — always sayin’ the wrong thing at the wrong ___!\n1. place\n2. person\n3. candy"
            }]
          }
        }]
      };
    }
  }
}
