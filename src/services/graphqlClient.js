import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getUserToken } from './api';

const GRAPHQL_URL = `${window.location.origin.replace(/\/+$/, '')}/graphql`;

const httpLink = new HttpLink({
  uri: GRAPHQL_URL
});

const authLink = setContext((_, { headers }) => {
  const token = getUserToken();
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : ''
    }
  };
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache()
});
