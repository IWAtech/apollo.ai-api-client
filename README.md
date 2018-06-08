# apollo-ai-api-client

This is the official client for the apollo.ai API.

## Installation

```
npm i apollo-ai-api-client 
```

## Importing with typescript

```
import { ApolloAiClient, IAutoAbstractResponse } from 'apollo-ai-api-client';
```

## Usage

```
  const apolloClient = new ApolloAiClient('your apollo API key');
  const result: IAutoAbstractResponse = await apolloClient.autoabstract(headline, text, maxCharacters, keywords);
```
