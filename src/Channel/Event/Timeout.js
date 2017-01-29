import winston from 'winston';

export default class TimeoutEvent {
  static register(event, func) {
    event.receive('timeout', () => {
      winston.info('Networking issue. Still waiting...');

      if (func) {
        func();
      }
    });

    return event;
  }
}
