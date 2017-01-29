import logger from '../../Logger';

export default class ErrorEvent {
  static register(event, func) {
    event.receive('error', ({reason}) => {
      logger.error('Failed join', reason);

      if (func) {
        func();
      }
    });

    return event;
  }
}
