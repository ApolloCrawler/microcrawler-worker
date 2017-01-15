export default class TimeoutEvent {
  static register(event, func) {
    event.receive('timeout', () => {
      console.log('Networking issue. Still waiting...');

      if (func) {
        func();
      }
    });

    return event;
  }
}
