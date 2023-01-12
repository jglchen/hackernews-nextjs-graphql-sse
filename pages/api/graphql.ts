import { createYoga, createPubSub, createSchema } from 'graphql-yoga';
import db from '@/lib/firestoreAdmin';
import { Timestamp } from 'firebase-admin/firestore';
import { getUserId } from '@/backsrc/utils';
import * as Query from '@/resolvers/Query';
import * as Mutation from '@/resolvers/Mutation';
import * as Subscription from '@/resolvers/Subscription';
import * as User from '@/resolvers/User';
import * as Link from '@/resolvers/Link';
import * as Vote from '@/resolvers/Vote';
import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next'

const pubsub = createPubSub();

const resolvers = {
  Query,
  Mutation,
  Subscription,
  User,
  Link,
  Vote
};

export const config = {
  api: {
    // Disable body parsing (required for file uploads)
    bodyParser: false,
  },
};

export default createYoga<{
  req: NextApiRequest
  res: NextApiResponse
}>({
  graphqlEndpoint: '/api/graphql',
  schema: createSchema({
    typeDefs: fs.readFileSync(
      path.join(process.cwd(), 'backsrc', 'schema.graphql'),
      'utf8'
    ),
    resolvers,
  }),
  context: ({req}) => {
    return {
      req,
      db,
      Timestamp,
      pubsub,
      userId: 
        req && req.headers.authorization
          ? getUserId(req)
          : null
    };
  },
});
