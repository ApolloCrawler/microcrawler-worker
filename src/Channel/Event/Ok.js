import logger from '../../Logger';

export default class OkEvent {
  static register(event, func) {
    event.receive('ok', (payload) => {
      logger.debug('Received ok', JSON.stringify(payload, null, 4));

      if (func) {
        func();
      }
    });

    return event;
  }
}
