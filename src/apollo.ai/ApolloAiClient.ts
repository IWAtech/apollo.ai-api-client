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

export interface IArticle {
  id: string;
  headline?: string;
  content: string;
  url?: string;
  date?: Date;
  abstract?: string[];
}

export interface IContinuesClusteringInput {
  newArticles: IArticle[] | string[];
  result?: IContinuesClusteringResultItem[];
  abstractMaxChars?: number;
}

export interface IContinuesClusteringResultItem {
  article: IArticle;
  related: string[];
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
  // todo replace staging endpoint
  public continuedClusteringEndpoint = 'https://beta.apollo.ai/api/combinedapi';
  public autoAbstractEndpoint = 'autoabstract';

  constructor(protected apiKey: string) {}

  private async executeAutoabstract(body: IAbstractInputBody, debug: boolean = false) {
    const response = await fetch(this.apolloApiEndpoint + this.autoAbstractEndpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.apiKey,
      },
      body: JSON.stringify(Object.assign({ debug }, body)),
    });

    if (response.status !== 200) {
      throw Error('Received invalid response from autoabstract endpoint');
    }

    return await response.json();
  }

  // Endpoint Autoabstract URL
  public async autoabstractUrl(
    url: string, maxCharacters = 400,
    keywords?: string[], maxSentences?: number, debug?: boolean): Promise<IAutoAbstractResponse> {

    const body: IAbstractInputBody = {
      url,
      keywords: keywords ? keywords.join(',') : '',
    };

    if (maxSentences) {
      body.maxSentences = maxSentences;
    } else {
      body.maxCharacters = maxCharacters;
    }

    return await this.executeAutoabstract(body, debug);
  }

  // Endpoint Autoabstract
  public async autoabstract(
    headline: string, text: string, maxCharacters = 400,
    keywords?: string[], maxSentences?: number, debug?: boolean): Promise<IAutoAbstractResponse> {
    const body: IAbstractInputBody = {
      headline,
      text,
      keywords: keywords ? keywords.join(',') : '',
    };

    if (maxSentences) {
      body.maxSentences = maxSentences;
    } else {
      body.maxCharacters = maxCharacters;
    }

    return await this.executeAutoabstract(body, debug);
  }

  // Endpoint Clustering
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

  // Endpoint continuedClustering + Autoabstract
  public async continuedClustering(
    newArticles: IArticle[] | string[],
    presentArticles: IContinuesClusteringResultItem[] = [],
    abstractMaxChars: number = 500) {
    // const url = new URL.URL(this.apolloApiEndpoint + this.continuedClusteringEndpoint);
    // const url = new URL.URL(this.continuedClusteringEndpoint);
    const parameters: IContinuesClusteringInput = {
      newArticles,
      abstractMaxChars,
    };

    if (presentArticles && presentArticles.length > 0) {
      parameters.result = presentArticles;
    }

    const clusteringResult = await fetch(this.continuedClusteringEndpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.apiKey,
      },
      body: JSON.stringify(parameters),
      timeout: 300000,
    });

    return await clusteringResult.json();
  }

}
