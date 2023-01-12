import type { AppProps } from 'next/app'
import '@/styles/index.css';
import 'tachyons/css/tachyons.min.css';
import { ApolloProvider } from '@apollo/client';
import client from '@/lib/apllo-client';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
       <Component {...pageProps} />
     </ApolloProvider>
 );
}
