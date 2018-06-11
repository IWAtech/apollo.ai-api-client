import fetch from 'node-fetch';

export interface IAutoAbstractResponse {
  sentences: [string];
  detectedLanguage: string;
  processedLanguage: string;
  input: any;
  type: string;
  url: string;
}

export class ApolloAiClient {

  constructor(protected apiKey: string) {}

  public async autoabstract(headline: string, text: string, maxCharacters = 400, keywords?: string[]): Promise<IAutoAbstractResponse> {

    const body = {
      headline,
      text,
      maxCharacters,
      keywords: '',
    };

    if (keywords) {
      body.keywords = keywords.join(',');
    }

    const response = await fetch('https://api.apollo.ai/autoabstract', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.apiKey,
      },
      body: JSON.stringify(body),
    });

    if (response.status !== 200) {
      throw Error('Received invalid response from autoabstract endpoint');
    }

    return await response.json();
  }

}
