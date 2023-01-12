import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import  secureLocalStorage  from  "react-secure-storage";
import { AUTH_TOKEN, TEMP_TOKEN } from './constants';

const authLink = setContext(async (_, { headers }) => {
  const token = secureLocalStorage.getItem(AUTH_TOKEN) || secureLocalStorage.getItem(TEMP_TOKEN);
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ''
    }
  };
});

const httpLink = new HttpLink({
uri: '/api/graphql'
});

const client = new ApolloClient({
link: authLink.concat(httpLink),
cache: new InMemoryCache()
});

export default client;
/*
import {
  HttpLink,
  ApolloClient,
  InMemoryCache,
  split
} from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { setContext } from '@apollo/client/link/context';
import  secureLocalStorage  from  "react-secure-storage";
import { AUTH_TOKEN, TEMP_TOKEN } from './constants';

const httpLink = new HttpLink({
  uri: '/api/graphql'
});

const wsLink = typeof window !== "undefined" ? new GraphQLWsLink(createClient({
  url: `${window.location.protocol.toLowerCase().replace('https','wss').replace('http','ws')}//${window.location.host}/api/graphql`,
  connectionParams: async function() {
    const token = secureLocalStorage.getItem(AUTH_TOKEN) || secureLocalStorage.getItem(TEMP_TOKEN);
    return ({authToken: token});
  },
})): null;


const authLink = setContext((_, { headers }) => {
  const token = secureLocalStorage.getItem(AUTH_TOKEN) || secureLocalStorage.getItem(TEMP_TOKEN);
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ''
    }
  };
});

// The split function takes three parameters:
//
// * A function that's called for each operation to execute
// * The Link to use for an operation if the function returns a "truthy" value
// * The Link to use for an operation if the function returns a "falsy" value
const splitLink = typeof window !== "undefined" ? split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink!,
  authLink.concat(httpLink),
):authLink.concat(httpLink);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache()
});

export default client;
*/


