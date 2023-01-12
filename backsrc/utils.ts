import jwt from 'jsonwebtoken';
import store from 'store2';
import db from '@/lib/firestoreAdmin';
import type { NextApiRequest } from 'next';
import {UserJwtPayload} from '@/lib/types';


function getTokenPayload(token: string) {
  return jwt.verify(token, process.env.NEXT_PUBLIC_JWT_APP_SECRET as string);
  //return jwt.verify(token, 'GraphQL-is-aw3some');
}

export function getUserId(req: NextApiRequest, authToken?: string) {
  if (req) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      if (!token) {
        throw new Error('No token found');
      }
      const { userId } = getTokenPayload(token) as UserJwtPayload;
      return userId;
    }
  } else if (authToken) {
    const { userId } = getTokenPayload(authToken) as UserJwtPayload;
    return userId;
  }

  throw new Error('Not authenticated');
}

export async function getLinkDoc(id: string){
  const linkKey = 'link'.concat('_', id);
  if (store(linkKey)){
     return JSON.parse(store(linkKey));
  }  
  
  const doc = await db.collection('graphql').doc('hackernews').collection('feed').doc(id).get();
  if (!doc.exists){
     return null; 
  }
  const linkDoc = {id, ...doc.data()};
  store(linkKey, JSON.stringify(linkDoc));
  return linkDoc;
}

export async function getUserDoc(id: string){
  const userKey = 'user'.concat('_', id);
  if (store(userKey)){
      return JSON.parse(store(userKey));
  }
  
  const doc = await db.collection('graphql').doc('hackernews').collection('user').doc(id).get();
  if (!doc.exists){
      return null;
  }
  
  const userDoc = {id, ...doc.data()};
  store(userKey, JSON.stringify(userDoc));
  return userDoc;
}

export async function getVoteDoc(id: string){
  const voteKey = 'vote'.concat('_', id);
  if (store(voteKey)){
      return JSON.parse(store(voteKey));
  }

  const doc = await db.collection('graphql').doc('hackernews').collection('vote').doc(id).get();
  if (!doc.exists) {
     return null;
  }
  
  const voteDoc = {id, ...doc.data()};
  store(voteKey, JSON.stringify(voteDoc));
  return voteKey;
}

