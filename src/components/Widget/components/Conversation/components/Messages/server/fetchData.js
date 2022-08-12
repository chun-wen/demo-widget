import jwt from 'jsonwebtoken'

const clientToken = (sessionId) => jwt.sign(
    { user: { username: sessionId, role: 'admin' } },
    'ji3ul4xu656xk7',
    {
        algorithm: 'HS256',
        expiresIn: '30s',
    },
);

export default async (url, sessionId, earliestTimeStamp) => {
    const requestURL = `${url}/${sessionId}/retrieve_historical_conversations?output_channel=socketChannel.SocketIOInput&message_count=30&earliest_message_time=${earliestTimeStamp / 1000}`
    const token = clientToken(sessionId);
    try {
        const result = await window.fetch(requestURL, {
            method: 'post',
            headers: new Headers({
                Accept: 'application/json',
                Authorization: `Bearer ${token}`
            })
        })
        if (!result.ok) {
            console.log(result.statusText);
        }
        const resultJSON = await result.json();
        return resultJSON;
    } catch (error) {
        console.log(`request message ${error}`);
    }
}
