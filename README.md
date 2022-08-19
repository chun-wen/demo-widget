- v1.1.38
1. Modified scroll logic
2. Fixed the isLoggedIn props typo

- v1.1.37
1. Fix retrieving messages from server logic.

- v1.1.36
1. Downgrade to v1.1.30 to socket.io version 4.5.1 by cherrypick 87ad343f7cabb2a99b5fc4ec8b5ed9a4537651d8

- v1.1.35
1. Fix init payload logic.

- v1.1.34
1. Fix get undefined sessionID.

- v1.1.33
1. Retrieve history messages and resend welcome messages.
2. Set _sessionID and _userID to cookies to tell is same user login.
3. Update socket.io version to 4.5.1

- v1.1.32
1. Handle lost messages from agent and resend welcome messages.
2. Session ID from Cookies.

- v1.1.31
1. Add new infinite scroll feature.

- v1.1.30
1. Fix Socket-io client error 
2. Adjust websocket default timeout 

- v1.1.29
1. Fix firefox enter event issue.
2. Add websocket parameter to test.
3. Add offline UI

- v1.1.28
1. Remove sessionID console.
2. Revert 1.1.27 commit.

- v1.1.27
1. Update package-lock.json

- v1.1.26
1. Upgrade socket-io client to 4 to test websocket Android external link issue.

- v1.1.25
1. Add Github repo link.

- v1.1.24
1. Test Android webSocket

- v1.1.23
1. Parse URL and Image.
2. Remove disconnect UI.

- v1.1.22
1. Clear localStorage when localID not equal to remoteID.

- v1.1.21
1. Handle undefined sessionID to null.

- v1.1.20
1. Socket "session_request" event modified "_userID" key to payload.
2. Add README.md version details.

- v1.1.19
1. Socket "session_request" event add "userID" to payload.

- v1.1.18
1. Change socketio.js connecting options from path to {tranport:['websocket']}.

- v1.1.17
1. To handle html A tag in socket message.





