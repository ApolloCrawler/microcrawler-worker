import logger from '../../Logger';

export default class PongHandler {
  static register(channel, func) {
    channel.on('pong', (payload) => {
      logger.debug('Received event - pong', JSON.stringify(payload, null, 4));

      if (func) {
        func();
      }
    });
  }
}
