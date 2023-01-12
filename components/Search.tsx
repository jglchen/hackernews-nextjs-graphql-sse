//firestore does not support full-text search. We have to set up third party search service 
//like Algolia(https://www.algolia.com/developers/firebase-search-extension/) to implement full
//text search. For this demonstration, we use an impractical solution in production as 
//downloading an entire collection to search for fields client-side.
import * as React from 'react';
import { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import client from '@/lib/apllo-client';
import  secureLocalStorage  from  "react-secure-storage";
import Link from './Link';
import {FeedData, VoteDataType, LinkType, LinkDataType, FeedQueryParms, Vote } from '@/lib/types';
import { TEMP_TOKEN } from '@/lib/constants';
import loaderStyles from '@/styles/loader.module.css';

const NEW_MSG_SUBSCRIPTION = `
  subscription {
    newMessage {
      msgkind
      newlink {
        id
        description
        url
        postedById
        createdAt
      }
      newvote {
        id
        linkId
        userId
      }
    }
  }
`;
const Search = () => {
  const base = typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}`: 'http://localhost:3000';
  const [searchFilter, setSearchFilter] = useState('');
  const [searchResult, setSearchResult] = useState<LinkType[]>([]);
  const [data, setData] = useState<FeedData | null>(null);
  const [inLoading, setInLoading] = useState(false);
  const [reconnect, setReconect] = useState(0);
  
  useEffect(()=> {
    secureLocalStorage.removeItem(TEMP_TOKEN);
  },[]);

  //EventSource listening on NEW_MSG_SUBSCRIPTION
  useEffect(() => {
    const url = new URL('/api/graphql', base);
    url.searchParams.append(
      'query',
      NEW_MSG_SUBSCRIPTION
    );
    const eventSource = new EventSource(url.toString().replace(base,''), {
      withCredentials: true // This is required for cookies
    });
      
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const newMessage = data.data.newMessage;
      if (newMessage.msgkind === 'NEW_VOTE'){
        voteDataUpdate(newMessage.newvote);
        voteSearchResultUpdate(newMessage.newvote);
        voteCacheUpdate(newMessage.newvote);
      }
    };

    eventSource.onerror = (event) => {
      setReconect(prevState => prevState+1);
    };

    setTimeout(() => setReconect(prevState => prevState+1), 5000);

    return () => {
      eventSource.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reconnect]);

  const voteDataUpdate = (newVote: VoteDataType) => {
    if (!data){
      return;
    }
    const { linkId, userId }  = newVote;
    const linkDataIndex = data.feed.links.findIndex(({id}) => id === linkId);
    if (linkDataIndex < 0){
      return;
    }
    const linkData =  data!.feed.links[linkDataIndex];  
    const exists = linkData.votes?.find(
      ({ id }) => id === newVote.id
    );
    if (exists){
      return;
    }

    const voteData = {
      __typename: 'Vote', 
      id: newVote.id,
      user: {
        __typename: 'User',
        id: userId
      }
    };
    const newVotes = [...(linkData.votes || []), voteData];
    const newLink = {...linkData, votes: newVotes};
    const links = [];
    for (let link of data!.feed.links) {
      links.push(link);
    } 
    links[linkDataIndex] = newLink;
    const newFeed = {...data!.feed, links: links};
    const newData = {...data, feed: newFeed};
    setData(newData);
  }
 
  const voteSearchResultUpdate = (newVote: VoteDataType) => {
    const { linkId, userId }  = newVote;
    const linkDataIndex = searchResult.findIndex(({id}) => id === linkId);
    if (linkDataIndex < 0){
      return;
    }
    const linkData =  searchResult[linkDataIndex];  
    const exists = linkData.votes?.find(
      ({ id }) => id === newVote.id
    );
    if (exists){
      return;
    }

    const voteData = {
      __typename: 'Vote', 
      id: newVote.id,
      user: {
        __typename: 'User',
        id: userId
      }
    };
  
    const newVotes = [...(linkData.votes || []), voteData];
    const newLink = {...linkData, votes: newVotes};
    const links = [];
    for (let link of searchResult) {
      links.push(link);
    } 
    links[linkDataIndex] = newLink;
    setSearchResult(links);
  }

  function voteCacheUpdate(newVote: VoteDataType) {
    const { linkId, userId }  = newVote;
    const linkData = client.readFragment({
      id: `Link:${linkId}`,
      fragment: gql`
       fragment MyLink on Link {
          id
          votes {
            id
            user {
              id
            }
          }
       }
      `,   
    });
    if (!linkData){
      return;
    }
    const exists = (linkData.votes as Vote[]).find(
      ({ id }) => id === newVote.id
    );
    if (exists){
      return;
    }
  
    const voteData = {
      __typename: 'Vote', 
      id: newVote.id,
      user: {
        id: userId
      }
    };
  
    client.writeFragment({
      id: `Link:${linkId}`,
      fragment: gql`
        fragment LinkForVotes on Link {
          votes {
          id
          user {
           id
          }
        }
      }
      `,
      data: {
        votes: [...linkData.votes, voteData],
      },
    });
  }  

  async function sendQuery(){
    if (!searchFilter){
       setSearchResult([]); 
       return;
    }
    
    if (!data){
       try {
        setInLoading(true);
        const result = await client.query({
             query: gql`
               query FeedQuery {
                 feed(take: 100, skip: 0, orderBy: {createdAt: desc}) {
                   id
                   links {
                     id
                     createdAt
                     url
                     description
                     postedBy {
                       id
                       name
                     }
                     votes {
                       id
                       user {
                         id
                       }
                     }
                   }
                   count
                 }
               }
             `
          });
          //console.log(result);
          setData(result.data);

          const links = result.data.feed.links.filter((item: LinkType) => 
             item.url.includes(searchFilter) || item.description.includes(searchFilter)
          );
          setSearchResult(links);
       }catch(err){
          //.....
       }
       setInLoading(false);
       return;
    }

    const links = data.feed.links.filter((item) => 
       item.url.includes(searchFilter) || item.description.includes(searchFilter)
    );
    setSearchResult(links);
  }

  return (
    <>
    <div>
      Search
      <input
        type="text"
        onChange={(e) => setSearchFilter(e.target.value)}
      />
      <button
        onClick={() => {
          sendQuery();
        }}
      >
        OK
      </button>
    </div>
    {
      searchResult.map((link, index) => (
        <Link key={link.id} link={link} index={index} />
      ))
    }
    {inLoading &&
      <div className={loaderStyles.loadermodal}>
        <div className={`${loaderStyles.loader} ${loaderStyles.div_on_center}`} />
      </div>
    }
   </>
  );
};

export default Search;
