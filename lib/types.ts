export interface UserJwtPayload {
    userId: string;
}
export interface FeedData {
    feed: Feed;
}

export interface Feed {
    id: string;
    links: LinkType[];
    count: number;
}

export interface FeedQueryParms {
    filter?: string;
    skip: number;
    take: number;
    orderBy: LinkOrderByInput;
}

export interface LinkType {
    id: string;
    description: string;
    url: string;
    postedBy: User;
    votes?: Vote[];
    createdAt: number | string;
    __typename?: string;
}

export interface LinkDataType {
    id: string;
    description: string;
    url: string;
    postedById?: string;
    key?: string;
    publiccode?: string;
    votes?: Vote[];
    createdAt: number;
}

export interface LinkProps {
    key: string;
    link: LinkType;
    index: number;
}
  
export interface AuthPayload {
    token: string;
    user: User;
}

export interface User {
    id: string;
    name?: string;
    email?: string;
    links?: LinkType[];
    password?: string;
    token?: string;
}

export interface Vote {
    id: string;
    link?: LinkType;
    user: User;
    __typename?: string;
}

export interface VoteDataType {
    id: string;
    linkId: string;
    userId: string;
    key?: string;
    publiccode?: string;
}

export interface VoteSavedType {
    linkId: string;
    userId: string;
}

export interface LinkOrderByInput {
    description?: string;
    url?: string;
    createdAt?: string;
}

export interface PasswdCheck {
    mail_sent: number;
    numForCheck: string;
    token: string;
    __typename?: string;
}


