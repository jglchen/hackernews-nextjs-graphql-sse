import store from 'store2';
import {getLinkDoc, getUserDoc} from '@/backsrc/utils';
import { VoteDataType } from '@/lib/types';

// @ts-ignore
export async function postedBy(parent, args, context) {
   const linkDoc = await getLinkDoc(parent.id);
   if (!linkDoc) {
      return null;
   } 
   const {postedById} = linkDoc;
   if (!postedById){
       return null;
   }
   
   return await getUserDoc(postedById);
}

// @ts-ignore
export async function votes(parent, args, context) {
    const voteKey = 'linkvotes'.concat('_', parent.id);
    if (store(voteKey)){
       return JSON.parse(store(voteKey));
    }  
    
    const snapshot = await context.db.collection('graphql').doc('hackernews').collection('vote').where('linkId', '==', parent.id).get();
    if (snapshot.empty) {
       store(voteKey, JSON.stringify([]));
       return [];
    } 

    const votesArr: VoteDataType[] = [];
    snapshot.forEach((doc: any) => {
        votesArr.push({id: doc.id, ...doc.data()});
    });    
    store(voteKey, JSON.stringify(votesArr));
    return votesArr;
}
