import logger from '../../Logger';

export default class TimeoutEvent {
  static register(event, func) {
    event.receive('timeout', () => {
      logger.info('Networking issue. Still waiting...');

      if (func) {
        func();
      }
    });

    return event;
  }
}
