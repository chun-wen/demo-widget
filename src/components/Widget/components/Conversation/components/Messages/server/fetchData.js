import jwt from 'jsonwebtoken'

const clientToken = (sessionId) => jwt.sign(
    { user: { username: sessionId, role: 'admin' } },
    'ji3ul4xu656xk7',
    {
        algorithm: 'HS256',
        expiresIn: '30s',
    },
);

const postFunc = (url, token) => window.fetch(url, {
    method: 'post',
    headers: new Headers({
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
    })
})

export const fetchOldMessage = async (url, sessionId, earliestTimeStamp) => {
    const requestURL = `${url}/${sessionId}/retrieve_historical_conversations?output_channel=socketChannel.SocketIOInput&message_count=30&earliest_message_time=${earliestTimeStamp}`
    const token = clientToken(sessionId);
    try {
        const result = await postFunc(requestURL, token)
        if (!result.ok) {
            console.log(result.statusText);
        }
        const resultJSON = await result.json();
        return resultJSON;
    } catch (error) {
        console.log(`request message ${error}`);
    }
}

export const resendWelcomeMessage = async (url, sessionId, latestTimeStamp) => {
    const token = clientToken(sessionId);
    const user_reconnect_time = Date.now() / 1000;
    const queryString = `output_channel=socketChannel.SocketIOInput&last_message_time=${latestTimeStamp}&user_reconnect_time=${user_reconnect_time}&session_expiration_time=60`
    const requestURL = `${url}/${sessionId}/resend_welcome_message?${queryString}`
    try {
        const result = await postFunc(requestURL, token)
        if (!result.ok) {
            console.log(result.statusText);
        }
        const resultJSON = await result.json();
        return resultJSON;
    } catch (error) {
        console.log(`request message ${error}`);
    }
}
