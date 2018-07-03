import fetch from 'node-fetch';

export interface IAutoAbstractResponse {
  sentences: string[];
  detectedLanguage?: string;
  processedLanguage?: string;
  input?: any;
  type: string;
  url: string;
}

export interface IClusteringResponse {
  status: number;
  message: string;
  data: IClusteringArticle[][];
}

export interface IClusteringArticle {
  id: string;
  title: string;
  content: string;
  link?: string;
  publication_date?: string;
  image?: string;
}

export enum ClusteringLanguage {
  en = 'en',
  de = 'de',
}

export class ApolloAiClient {

  public apolloApiEndpoint = 'https://api.apollo.ai/';

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

    const response = await fetch(this.apolloApiEndpoint + 'autoabstract', {
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

  public async clustering(articles: IClusteringArticle[], threshold = 0.8, language = ClusteringLanguage.de): Promise<IClusteringResponse> {

    const url = new URL(this.apolloApiEndpoint + '/clustering');
    url.searchParams.append('threshold', threshold.toString());
    url.searchParams.append('language', language);

    const collectionResult = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.apiKey,
      },
      body: JSON.stringify(articles),
      timeout: 300000,
    });
    const clusterResult = await collectionResult.json();
    return clusterResult;
  }

}
