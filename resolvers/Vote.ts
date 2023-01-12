import {getLinkDoc, getUserDoc} from '@/backsrc/utils';

// @ts-ignore
export async function link(parent, args, context) {
    return await getLinkDoc(parent.linkId);
}

// @ts-ignore
export async function user(parent, args, context) {
    return await getUserDoc(parent.userId);
}    