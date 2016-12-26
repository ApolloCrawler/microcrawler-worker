export default class OkEvent {
  static register(event, func) {
    event.receive('ok', (payload) => {
      console.log('Received ok');
      console.log(JSON.stringify(payload, null, 4));

      if (func) {
        func();
      }
    });

    return event;
  }
}
