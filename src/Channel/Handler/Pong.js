export default class PongHandler {
  static register(channel, func) {
    channel.on('pong', (payload) => {
      console.log('Received event - pong');
      console.log(JSON.stringify(payload, null, 4));

      if (func) {
        func();
      }
    });
  }
}
