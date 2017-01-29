import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logger = new (winston.Logger)({
  transports: [
    new DailyRotateFile({
      filename: './logs/worker',
      datePattern: '-yyyy-MM-dd.log',
      json: false,
      level: process.env.ENV === 'development' ? 'debug' : 'info'
    }),

    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true
    })
  ],

  exceptionHandlers: [
    new DailyRotateFile({
      filename: './logs/worker-exceptions',
      datePattern: '-yyyy-MM-dd.log',
      json: false,
      handleExceptions: true,
      level: process.env.ENV === 'development' ? 'debug' : 'info'
    })
  ]
});

export default logger;
