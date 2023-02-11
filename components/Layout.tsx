import Head from 'next/head';
import Header from './Header';

export default function Layout({ children }: {children: JSX.Element}) {
    return (
      <div className="center layoutwidth">
        <Head>
             <title>Hackernews Clone Site with GraphQL (includes GraphQL subscriptions)</title>
             <link rel="icon" href="/favicon.ico" />
             <meta
              name="description"
              content="A Hackernews clone site built built with next.js implementing GraphQL APIs, for which Apollo Client is adopted in the frontend and GraphQL Yoga in the backend server" 
              />
             <meta name="og:title" content="Hackernews Clone Site with GraphQL (includes GraphQL subscriptions)" />
             <meta
              property="og:description"
              content="A Hackernews clone site built built with next.js implementing GraphQL APIs, for which Apollo Client is adopted in the frontend and GraphQL Yoga in the backend server"
              />
        </Head>
        <Header />
        <div className="ph3 pv1 background-gray">
            {children}
        </div>
     </div>   
    );

}    
