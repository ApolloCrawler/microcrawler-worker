import winston from 'winston';

class WebSocketLogger extends winston.Transport {
  constructor(options) {
    super(options);

    //
    // Name this logger
    //
    this.name = 'webSocketLogger';

    //
    // Set the level from your options
    //
    this.level = (options && options.level) || 'info';

    //
    // Configure your storage backing as you see fit
    //
  }

  /* eslint-disable class-methods-use-this */
  log(level, msg, meta, callback) {
    console.log(
      'WebSocketLogger',
      level,
      msg,
      meta
    );

    //
    // Store this message and metadata, maybe use some custom logic
    // then callback indicating success.
    //
    callback(null, true);
  }
  /* eslint-enable class-methods-use-this */
}

winston.transports.WebSocketLogger = WebSocketLogger;

export default WebSocketLogger;
