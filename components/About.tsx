import * as React from 'react';
import { useEffect } from "react";
import  secureLocalStorage  from  "react-secure-storage";
import { TEMP_TOKEN } from '@/lib/constants';

const About = () => {
    useEffect(()=> {
        secureLocalStorage.removeItem(TEMP_TOKEN);
    },[]);
    
    return (
        <div className="pv2 ph0">
           This is a <a className="blue" href="https://news.ycombinator.com/" target="_blank" rel="noreferrer">Hackernews</a> clone site built with next.js implementing GraphQL APIs, for which Apollo Client is adopted in the frontend and GraphQL Yoga in the backend server. 
           <p>
           Subscriptions are a GraphQL feature that allows a server to send data to its clients when a specific event happens. Subscriptions are usually implemented with  <a className="blue" href="https://en.wikipedia.org/wiki/WebSocket" target="_blank" rel="noreferrer">WebSockets</a> or <a className="blue" href="https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events" target="_blank" rel="noreferrer">Server-Sent Events</a>. GraphQL Yoga uses <a className="blue" href="https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events" target="_blank" rel="noreferrer">Server-Sent Events</a> for the subscription protocol.
           </p>
           <p>
           The real-time communication of subscriptions however was found not to function well once the package is deployed to Vercel, which is a serverless platform. We will not deploy this package to Vercel, however, a dockerized package of this app is prepared.
           </p>
        </div>
    );
}; 

export default About;