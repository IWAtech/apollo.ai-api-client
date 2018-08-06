import fetch from 'node-fetch';
import * as URL from 'url';

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
  identifier: string;
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

export interface IAbstractInputBody {
  headline?: string;
  text?: string;
  url?: string;
  maxSentences?: number;
  maxCharacters?: number;
  keywords?: string;
}

export class ApolloAiClient {

  public apolloApiEndpoint = 'https://api.apollo.ai/';
  public clusteringEndpoint = 'clustering';
  public autoAbstractEndpoint = 'autoabstract';

  constructor(protected apiKey: string) {}

  private async executeAutoabstract(body: IAbstractInputBody) {
    const response = await fetch(this.apolloApiEndpoint + this.autoAbstractEndpoint, {
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

  public async autoabstractUrl(
    url: string, maxCharacters = 400,
    keywords?: string[], maxSentences?: number): Promise<IAutoAbstractResponse> {

    const body: IAbstractInputBody = {
      url,
      keywords: '',
    };

    if (maxSentences) {
      body.maxSentences = maxSentences;
    } else {
      body.maxCharacters = maxCharacters;
    }

    if (keywords) {
      body.keywords = keywords.join(',');
    }

    return await this.executeAutoabstract(body);
  }

  public async autoabstract(
    headline: string, text: string, maxCharacters = 400,
    keywords?: string[], maxSentences?: number): Promise<IAutoAbstractResponse> {
    const body: IAbstractInputBody = {
      headline,
      text,
      keywords: '',
    };

    if (maxSentences) {
      body.maxSentences = maxSentences;
    } else {
      body.maxCharacters = maxCharacters;
    }

    if (keywords) {
      body.keywords = keywords.join(',');
    }

    return await this.executeAutoabstract(body);
  }

  public async clustering(articles: IClusteringArticle[], threshold = 0.8, language = ClusteringLanguage.de): Promise<IClusteringResponse> {

    const url = new URL.URL(this.apolloApiEndpoint + this.clusteringEndpoint);
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
