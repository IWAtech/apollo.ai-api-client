import fetch from 'node-fetch';
import { URL } from 'url';

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

export interface IContinuousClusteringResponse {
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

export interface IContinuousClusteringOptions {
  abstractMaxChars?: number;
  keywords?: string[];
  threshold?: number;
  language?: ClusteringLanguage;
}

export interface IContinuousClustering {
  newArticles?: IArticle[] | string[];
  result?: IContinuousClusteringResultItem[];
}

export interface IContinuousClusteringInput extends IContinuousClustering {
  options?: IContinuousClusteringOptions;
}

export interface IContinuousClusteringResponse extends IContinuousClustering {
  invalidArticles: Array<string | IArticle>;
}

export interface IContinuousClusteringResultItem {
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
  // public continuedClusteringEndpoint = 'https://beta.apollo.ai/api/combinedapi';
  public autoAbstractEndpoint = 'autoabstract';
  public debug = false;
  public combinedApiEndpoint = 'combinedapi';

  constructor(protected apiKey: string) {}

  private executeAutoabstract(body: IAbstractInputBody, debug: boolean = false) {
    return fetch(this.apolloApiEndpoint + this.autoAbstractEndpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.apiKey,
      },
      body: JSON.stringify(Object.assign({ debug }, body)),
    }).then((response) => {
      if (response.status !== 200) {
        return Promise.reject({ message: 'Received invalid response from autoabstract endpoint', error: response.text() });
      } else {
        return response.json();
      }
    }).catch((err) => {
      return Promise.reject({ message: 'Received invalid response from autoabstract endpoint', error: err });
    });
  }

  // Endpoint Autoabstract URL
  public autoabstractUrl(
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

    return this.executeAutoabstract(body, debug);
  }

  // Endpoint Autoabstract
  public autoabstract(
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

    return this.executeAutoabstract(body, debug);
  }

  // Endpoint Clustering
  public clustering(articles: IClusteringArticle[], threshold = 0.8, language = ClusteringLanguage.de) {
    const url = new URL(this.apolloApiEndpoint + this.clusteringEndpoint);
    url.searchParams.append('threshold', threshold.toString());
    url.searchParams.append('language', language);

    return fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.apiKey,
      },
      body: JSON.stringify(articles),
      timeout: 300000,
    }).then((clusteringResult) => clusteringResult.json() as Promise<IClusteringResponse[]>);
  }

  // Endpoint continuedClustering + Autoabstract
  public continuedClustering(
    newArticles: IArticle[] | string[],
    presentArticles: IContinuousClusteringResultItem[] = [],
    options: IContinuousClusteringOptions = {}): Promise<IContinuousClusteringResponse> {

    const parameters: IContinuousClusteringInput = {newArticles};

    if (presentArticles && presentArticles.length > 0) {
      parameters.result = presentArticles;
    }

    const url = new URL(this.apolloApiEndpoint + this.combinedApiEndpoint);

    if (options.abstractMaxChars !== undefined) {
      url.searchParams.append('maxChars', options.abstractMaxChars.toString());
    }

    if (options.keywords) {
      url.searchParams.append('keywords', options.keywords.join(','));
    }

    if (options.threshold !== undefined) {
      url.searchParams.append('threshold', options.threshold.toString());
    }

    if (options.language) {
      url.searchParams.append('language', options.language);
    }

    return fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.apiKey,
      },
      body: JSON.stringify(parameters),
      timeout: 300000,
    }).then((clusteringResult) => clusteringResult.json() as Promise<IContinuousClusteringResponse>);
  }

}
