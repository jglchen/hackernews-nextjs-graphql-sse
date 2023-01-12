## Hackernews Clone Site with GraphQL

This is a [Hackernews](https://news.ycombinator.com/) clone site built with next.js implementing GraphQL APIs, for which Apollo Client is adopted in the frontend and GraphQL Yoga in the backend server.
           
Subscriptions are a GraphQL feature that allows a server to send data to its clients when a specific event happens. Subscriptions are usually implemented with [WebSockets](https://en.wikipedia.org/wiki/WebSocket) or [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events). GraphQL Yoga uses [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) for the subscription protocol.

The real-time communication of subscriptions however was found not to function well once the package is deployed to Vercel, which is a serverless platform. We will not deploy this package to Vercel, however, a dockerized package of this app is prepared.

### Docker: docker run -p 3000:3000 jglchen/hackernews-nextjs-graphql-sse
### [GitHub](https://github.com/jglchen/hackernews-nextjs-graphql-sse)
