import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import store from 'store2';
const APP_SECRET = process.env.NEXT_PUBLIC_JWT_APP_SECRET;
import { User } from '@/lib/types';

// @ts-ignore
export async function post(parent, args, context, info){
  if (!args.description){
    throw new Error('Please enter description');
  }
  if (!args.url){
    throw new Error('Please enter url');
  }

  const { userId } = context;
  if (!userId) {
     throw new Error('Please signin first');
  }

  const linkData = {    
    url: args.url,
    description: args.description,
    createdAt: context.Timestamp.now().toMillis(),
    postedById: userId,
  };
  const result = await context.db.collection('graphql').doc('hackernews').collection('feed').add(linkData);
  const newLink = {id: result.id, ...linkData}; 
  //Store link
  const linkKey = 'link'.concat('_', result.id);
  store(linkKey, JSON.stringify(newLink));
  //Store userLinksKey
  const userLinksKey = 'userlinks'.concat('_', userId);
  if (store(userLinksKey)){
     const userLinks = JSON.parse(store(userLinksKey));
     userLinks.push(newLink);
  }
  
  context.pubsub.publish("NEW_MSG", {msgkind: 'NEW_LINK', newlink: newLink}); 
  await context.db.collection('graphql').doc('hackernews').collection('recent').doc('newlink').set({key: 'newlink', publiccode: process.env.NEXT_PUBLIC_PUBLIC_CODE, ...newLink});
  return newLink;
}

// @ts-ignore
export async function signup(parent, args, context, info) {
  if (!args.name){
     throw new Error('Please enter your name');
  }
  if (!args.email){
    throw new Error('Please enter your email address');
  }
  if (!args.password){
    throw new Error('Please enter your password');
  }
  const snapshot = await context.db.collection('graphql').doc('hackernews').collection('user').where('email', '==', args.email).get();
  if (!snapshot.empty) {
     throw new Error('A account with the email already exists');
  }
  
  const password = await bcrypt.hash(args.password, 10);
  const userData = {...args, password};
  const result = await context.db.collection('graphql').doc('hackernews').collection('user').add(userData);
  const user = {id: result.id, ...userData};
  //Store userKey
  const userKey = 'user'.concat('_', result.id);
  store(userKey, JSON.stringify(user));
  const token = jwt.sign({ userId: user.id }, APP_SECRET!);

  return {
    token,
    user
  };
}

// @ts-ignore
export async function login(parent, args, context, info) {
  if (!args.email){
    throw new Error('Please enter your email address');
  }
  if (!args.password){
    throw new Error('Please enter your password');
  }
  const snapshot = await context.db.collection('graphql').doc('hackernews').collection('user').where('email', '==', args.email).get();
  if (snapshot.empty) {
     throw new Error('No such user found')
  }

  const userList: User[] = [];
  snapshot.forEach((doc: any) => {
     userList.push({id: doc.id, ...doc.data()});
  });
  const user = userList[0];

  const valid = await bcrypt.compare(args.password, user.password!)
  if (!valid) {
      throw new Error('Invalid password')
  }
  const token = jwt.sign({ userId: user.id }, APP_SECRET!)
    
  return {
    token,
    user
  };
}  

// @ts-ignore
export async function resetpasswd(parent, args, context, info) {
  if (!args.password){
    throw new Error('Please enter description');
  }
  
  const { userId } = context;
  if (!userId) {
     throw new Error('Please fill correct number in the designated box');
  }
            
  const password: string = await bcrypt.hash(args.password, 10);
  await context.db.collection('graphql').doc('hackernews').collection('user').doc(userId).update({password: password});
  const doc = await context.db.collection('graphql').doc('hackernews').collection('user').doc(userId).get();
  const userData = {id: userId, ...doc.data()} as User;
  return {...userData};
}  

// @ts-ignore
export async function vote(parent, args, context, info){
  const { userId } = context;
  if (!userId) {
     throw new Error('Please signin first');
  }

  const snapshot = await context.db.collection('graphql').doc('hackernews').collection('vote').where('linkId', '==', args.linkId).where('userId', '==', userId).get();
  if (!snapshot.empty) {
     throw new Error(`Already voted for link: ${args.linkId}`);
  }

  const voteData = {    
    userId: userId,
    linkId: args.linkId,
    //createdAt: context.Timestamp.now().toMillis(),
  };
  const result = await context.db.collection('graphql').doc('hackernews').collection('vote').add(voteData);
  const newVote = {id: result.id, ...voteData};
  //Store voteKey
  const voteKey = 'vote'.concat('_', result.id);
  store(voteKey, JSON.stringify(newVote));
  //Store linkVoteKey
  const linkVoteKey = 'linkvotes'.concat('_', args.linkId);
  if (store(linkVoteKey)){
     const linkVotes = JSON.parse(store(linkVoteKey));
     linkVotes.push(newVote);
     store(linkVoteKey, JSON.stringify(linkVotes));
  }
  context.pubsub.publish("NEW_MSG", {msgkind: 'NEW_VOTE', newvote: newVote}); 
  await context.db.collection('graphql').doc('hackernews').collection('recent').doc('newvote').set({key: 'newvote', publiccode: process.env.NEXT_PUBLIC_PUBLIC_CODE, ...newVote});
  return newVote;
}  