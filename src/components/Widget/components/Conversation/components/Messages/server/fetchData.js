import jwt from 'jsonwebtoken'

const clientToken = (sessionId) => jwt.sign(
    { user: { username: sessionId, role: 'admin' } },
    'ji3ul4xu656xk7',
    {
      algorithm: 'HS256',
      expiresIn: '6000s',
    },
);

export default async (url, sessionId, earliestTimeStamp) => {
    const requestURL = `${url}/${sessionId}/retrieve_historical_conversations?output_channel=socketChannel.SocketIOInput&message_count=100&earliest_message_time=${earliestTimeStamp/1000}`
    const token = clientToken(sessionId);
    const result = await window.fetch(requestURL, { 
        method: 'post', 
        headers: new Headers({
            Authorization:`Bearer ${token}`
        })
    })
    console.log(`I'm result ${JSON.stringify(result)}`);
    const { events } = result
    return events
}
