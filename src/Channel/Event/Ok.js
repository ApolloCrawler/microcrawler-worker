import winston from 'winston';

export default class OkEvent {
  static register(event, func) {
    event.receive('ok', (payload) => {
      winston.info('Received ok');
      winston.info(JSON.stringify(payload, null, 4));

      if (func) {
        func();
      }
    });

    return event;
  }
}
