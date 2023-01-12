import store from 'store2';
import { LinkType } from '@/lib/types';

// @ts-ignore
export async function links(parent, args, context) {
    const userKey = 'userlinks'.concat('_', parent.id);
    if (store(userKey)){
       return JSON.parse(store(userKey));
    }  

    const snapshot = await context.db.collection('graphql').doc('hackernews').collection('feed').where('postedById', '==', parent.id).get();
    if (snapshot.empty) {
       store(userKey, JSON.stringify([]));
       return [];
    } 
    
    const feedArr: LinkType[] = [];
    snapshot.forEach((doc: any) => {
      feedArr.push({id: doc.id, ...doc.data()});
    });    
    store(userKey, JSON.stringify(feedArr));
    return feedArr;
}
  