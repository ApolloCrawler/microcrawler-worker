export default class ErrorEvent {
  static register(event, func) {
    event.receive('error', ({reason}) => {
      console.log('Failed join', reason);

      if (func) {
        func();
      }
    });

    return event;
  }
}
