import { getUserDoc } from '@/backsrc/utils';
import { LinkType } from '@/lib/types';
import jwt from 'jsonwebtoken';
const APP_SECRET = process.env.NEXT_PUBLIC_JWT_APP_SECRET as string;
import { User } from '@/lib/types';
import {passwdResetHTML} from '@/lib/utils';
import { createGmailTransporter, outlookTransporter } from '@/lib/mailapi';
import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();


// @ts-ignore
export async function feed(parent, args, context) {
  //firestore does not support full-text search. We have to set up third party search service 
  //like Algolia(https://www.algolia.com/developers/firebase-search-extension/) to implement full
  //text search. For this demonstration, we use an impractical solution in production as 
  //downloading an entire collection to search for fields client-side.
  let feedRef = context.db.collection('graphql').doc('hackernews').collection('feed'); 
  if (args.orderBy){
     const {url, description, createdAt } = args.orderBy;
     if (url) {
        feedRef = feedRef.orderBy('url', String(url));
     }
     if (description){
        feedRef = feedRef.orderBy('description', String(description));
     }
     if (createdAt){
        feedRef = feedRef.orderBy('createdAt', String(createdAt));
     }
  }
  const offset = args.skip || 0;
  const limit = args.take || 0;
  const limitNum = offset + limit;
  if (limitNum && !args.filter){
     feedRef = feedRef.limit(limitNum);
  }


  const snapshot = await feedRef.get();
  if (snapshot.empty) {
      return [];
  } 
  
  const feedArr: LinkType[] = [];
  snapshot.forEach((doc: any) => {
      if (args.filter){
         const { url, description } = doc.data();
         if (url.includes(args.filter) || description.includes(args.filter)){
            const {createdAt} = doc.data();
            feedArr.push({id: doc.id, ...doc.data(), createdAt: new Date(createdAt)});
         }
      }else{
         const {createdAt} = doc.data();
         feedArr.push({id: doc.id, ...doc.data(), createdAt: new Date(createdAt)});
      }
      
  });
  
  let links;
  if (limitNum){
     links = feedArr.slice(offset, limitNum);
  }else{
     links = feedArr;
  }

  let idStr = 'mfeed-skip_'+ offset;
  if (limit){
     idStr += '-take_' + limit;
  }
    
  return {
     id: idStr,
     links,
     count: links.length
  }

}

// @ts-ignore
export async function user(parent, args, context) {
   return await getUserDoc(args.id);
}

// @ts-ignore
export async function forgotpasswd(parent, args, context) {
   
    const snapshot = await context.db.collection('graphql').doc('hackernews').collection('user').where('email', '==', args.email).get();
    if (snapshot.empty) {
        return (
            {
                mail_sent: false
            }
        );
    }
    
    const arr: any = [];
    snapshot.forEach((doc: any) => {
        arr.push({id: doc.id, ...doc.data()} as User); 
    });
    const user = arr[0];
    const token = jwt.sign({ userId: user.id}, APP_SECRET);
    const numForCheck = (Math.random() * 1000000).toFixed();

    let emailTransporter: any;
    let senderMail: string;
    // Create the transporter with the required configuration
    try{
       emailTransporter = await createGmailTransporter();
       senderMail = serverRuntimeConfig.GMAIL_EMAIL as string;
    }catch(err){
       emailTransporter = outlookTransporter;
       senderMail = serverRuntimeConfig.SENDER_MAIL_USER as string;
    }
    // setup e-mail data, even with unicode symbols
    const mailOptions = {
        from: `"No Reply - Hacker News Clone " <${senderMail}>`, // sender address (who sends)
        to: args.email, // list of receivers (who receives)
        subject: "Reset your password for Hacker News Clone", // Subject line
        html: passwdResetHTML(numForCheck)
    };
        
    try {
        if (senderMail === serverRuntimeConfig.GMAIL_EMAIL){
            await emailTransporter.sendMail(mailOptions);
        }else{
            //Code for ordinary local development
            //emailTransporter.sendMail(mailOptions);
            
            //Special code for Vercel
            await new Promise((resolve, reject) => {
                // verify connection configuration
                emailTransporter.verify(function (error: any, success: any) {
                    if (error) {
                        console.log(error);
                        reject(error);
                    } else {
                        console.log("Server is ready to take our messages");
                        resolve(success);
                    }
                });
            });
                            
            await new Promise((resolve, reject) => {
                // send mail
                emailTransporter.sendMail(mailOptions, (err: any, info: any) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        console.log(info);
                        resolve(info);
                    }
                });
            });
        }
    
    }catch(e){
        //-----
    }

    return {
        mail_sent: true,
        numForCheck,
        token
    }

}   