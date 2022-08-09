import jwt from 'jsonwebtoken'

const clientToken = (sessionId) => jwt.sign(
    { user: { username: sessionId, role: 'admin' } },
    'ryan_need_a_raise',
    {
      algorithm: 'HS256',
      expiresIn: '6000s',
    },
);

export default async (url, sessionId) => {
    const token = clientToken(sessionId);
    const result = await window.fetch(url, { 
        method: 'post', 
        headers: new Headers({
            Authorization:`Bearer ${token}`
        })
    })
    console.log(`I'm result ${result}`);
    const { events } = result
    return events
}
