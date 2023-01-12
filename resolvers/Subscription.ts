// @ts-ignore
function newMessageSubscribe(parent, args, context, info) {
  return context.pubsub.subscribe('NEW_MSG');
}

export const newMessage = {
  subscribe: newMessageSubscribe,
  resolve: (payload: any) => {
    return payload
  },
}
  
  