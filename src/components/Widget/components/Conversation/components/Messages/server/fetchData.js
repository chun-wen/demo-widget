import jwt from 'jsonwebtoken'

const clientToken = (sessionId) => jwt.sign(
    { user: { username: sessionId, role: 'admin' } },
    'ji3ul4xu656xk7',
    {
        algorithm: 'HS256',
        expiresIn: '30s',
    },
);

export const fetchOldMessage = async (url, sessionId, earliestTimeStamp) => {
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

export const resendWelcomeMessage = async (url, sessionId, latestTimeStamp) => {
    const token = clientToken(sessionId);
    const requestURL = `${url}/${sessionId}/resend_welcome_message?output_channel=socketChannel.SocketIOInput`
    const user_reconnect_time = Date.now() / 1000;
    try {
        const result = await window.fetch(requestURL, {
            method: 'post',
            headers: new Headers({
                Accept: 'application/json',
                Authorization: `Bearer ${token}`
            }),
            params: {
                last_message_time: latestTimeStamp,
                user_reconnect_time,
                session_expiration_time: 60,
            },
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

export const retrieveLostMessage = async (url, sessionId, latestTimeStamp) => {
    const requestURL = `${url}/${sessionId}/retrieve_bot_utterance?output_channel=socketChannel.SocketIOInput&last_message_time=${latestTimeStamp / 1000}`;
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
