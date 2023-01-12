import { useState, useEffect } from 'react';
import jwt from 'jsonwebtoken';
import { useMutation, gql } from '@apollo/client';
import  secureLocalStorage  from  "react-secure-storage";
import { AUTH_TOKEN, LINKS_PER_PAGE } from '@/lib/constants';
import { timeDifferenceForDate } from '@/lib/utils';
import {UserJwtPayload, LinkProps, Vote} from '@/lib/types';

const VOTE_MUTATION = gql`
  mutation VoteMutation($linkId: ID!) {
    vote(linkId: $linkId) {
      id
      link {
        id
        votes {
          id
          user {
            id
          }
        }
      }
      user {
        id
      }
    }
  }
`;

function getUserId(token: string | null) {
   if (!token){
      return null;   
   }
   const { userId } =  jwt.verify(token, process.env.NEXT_PUBLIC_JWT_APP_SECRET as string) as UserJwtPayload;
   return userId;
}

function isVoteCapable(token: string | null, votes: Vote[]){
   const userId = getUserId(token);
   if (!userId){
      return false;
   }
   
   const vote = votes.find((item) => 
       item.user.id == userId
   );
   if (vote){
      return false;
   }else{
     return true;
   }
}

const Link = (props: LinkProps) => {
  const { link } = props;
  const [authToken, setAuthToken] = useState<string | null>(null);
  const linkUrl = link.url.trim();
  
  const take = LINKS_PER_PAGE;
  const skip = 0;
  const orderBy = { createdAt: 'desc' };

  useEffect(() => {
    const token = secureLocalStorage.getItem(AUTH_TOKEN) as string;
    if (token){
       setAuthToken(token);
    }
  }, []);
  
  const [vote, {data, error}] = useMutation(VOTE_MUTATION, {
    variables: {
      linkId: link.id
    },
    /*
    update: (cache, {data: {vote}}) => {
      const { feed } = cache.readQuery({
        query: FEED_QUERY,
        variables: {
          take,
          skip,
          orderBy
        }
      });
  
      const updatedLinks = feed.links.map((feedLink) => {
        if (feedLink.id === link.id) {
          return {
            ...feedLink,
            votes: [...feedLink.votes, vote]
          };
        }
        return feedLink;
      });
  
      cache.writeQuery({
        query: FEED_QUERY,
        data: {
          feed: Object.assign({}, feed, {
            links: updatedLinks
          })
        },
        variables: {
          take,
          skip,
          orderBy
        }
      });
    },
    */
    onError: (err) => {
      //console.log(err);
    }
  });

  return (
    <div className="flex mt2 items-start">
      <div className="flex items-center">
        <span className="gray">{props.index + 1}.</span>
        {isVoteCapable(authToken, link.votes || []) && (
          <div
            className="ml1 gray f11"
            style={{ cursor: 'pointer' }}
            onClick={() => vote()}
          >
            ▲
          </div>
        )}
      </div>
      <div className="ml1">
        <div>
          {link.description} (<a href={linkUrl.toLowerCase().startsWith('http') ? linkUrl: 'https://' + linkUrl} target='_blank' rel="noreferrer">{linkUrl}</a>)
        </div>
        {(
          <div className="f6 lh-copy gray">
            {link.votes?.length} votes | by{' '}
            {link.postedBy ? link.postedBy.name : 'Unknown'}{' '}
            {timeDifferenceForDate(link.createdAt)}
          </div>
        )}
        <div className="f6 lh-copy red">{error && error.message}</div>
      </div>
    </div>
  );
};

export default Link;