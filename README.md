# apollo-ai-api-client

This is the official client for the [apollo.ai API](https://www.apollo.ai/api). Currently, only the autoabstract endpoint is supported. Support for the clustering and the pdf segmentation endpoints are planned.

To use this api, an API key is mandatory and [can be requested via our contact form](https://beta.apollo.ai/requestDemo). 

## Installation

```
npm i apollo-ai-api-client 
```

## Importing with typescript

```
import { ApolloAiClient, IAutoAbstractResponse } from 'apollo-ai-api-client';
```

## Usage of the apollo.ai autoabstract api

```
  const apolloClient = new ApolloAiClient('your apollo API key');
  const result: IAutoAbstractResponse = await apolloClient.autoabstract(headline, text, maxCharacters, keywords);
```
