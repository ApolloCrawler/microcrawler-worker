import winston from 'winston';

export default class ErrorEvent {
  static register(event, func) {
    event.receive('error', ({reason}) => {
      winston.error('Failed join', reason);

      if (func) {
        func();
      }
    });

    return event;
  }
}
