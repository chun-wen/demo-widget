import io from 'socket.io-client';

export default function (socketUrl, customData, path) {
  const options = {
      transports: ['websocket'],
      closeOnBeforeunload: false,
      autoConnect: true,
      autoUnref: false,
      forceNew: false,
      timeout: 86400000, // set timeout to 24hr
  };

  const socket = io(socketUrl, options);

  socket.on('connect', () => {
    // console.log(`connect:${socket.id}`);
    socket.customData = customData;
  });

  socket.on('connect_error', (error) => {
    console.log(error);
  });

  socket.on('disconnect', (reason) => {
    console.log(reason);
  });

  return socket;
}
