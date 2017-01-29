import winston from 'winston';

export default class PongHandler {
  static register(channel, func) {
    channel.on('pong', (payload) => {
      winston.info('Received event - pong');
      winston.info(JSON.stringify(payload, null, 4));

      if (func) {
        func();
      }
    });
  }
}
