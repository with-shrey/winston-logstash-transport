const winston = require('winston');
const LogstashTransport = require('./transport');
winston.transports.DailyRotateFile = require('winston-daily-rotate-file');
const CONSTANTS = require('./constants');
const moment = require('moment');
const print = require('./formats').print;
const logger = function (scope) {

  // If we're not in production then log to the `console` with the format:
  // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
  //
  let log;
  let defaultMeta = () => {
    return {
      scope: scope,
      application: CONSTANTS.APPLICATION_NAME,
      get time() {
        return moment().format();
      }
    }
  };
  if (CONSTANTS.NODE_ENV === 'development') {
    log = winston.createLogger({
      level: CONSTANTS.LOG_LEVEL,
      defaultMeta: defaultMeta(),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            print,
            winston.format.colorize(),
            winston.format.simple(),
          ),
        })
      ]
    });
  }
  else if (CONSTANTS.NODE_ENV === 'staging' || CONSTANTS.NODE_ENV === 'production') {
    let transports = [];
    if (CONSTANTS.SEND_TO_STDOUT)
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            print,
            winston.format.colorize(),
            winston.format.simple(),
          ),
        })
      );
    if (!CONSTANTS.SEND_TO_LOGSTASH) {
      let logDirectory = `/var/log/${CONSTANTS.APPLICATION_NAME}/application_log`;
      transports.push(new winston.transports.DailyRotateFile({
        dirname: logDirectory,
        filename: 'default-%DATE%.log',
        datePattern: 'YYYY-MM-DD-HH',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '7d'
      }));
      log = winston.createLogger({
        level: CONSTANTS.LOG_LEVEL,
        defaultMeta: defaultMeta(),
        format: print,
        transports
      });
    }
    else {
      log = LogstashTransport.createLogger({
        level: CONSTANTS.LOG_LEVEL,
        logstash: {
          host: CONSTANTS.LOGSTASH_SERVER_IP,
          port: CONSTANTS.LOGSTASH_PORT
        },
        application: CONSTANTS.APPLICATION_NAME,
        hostname: CONSTANTS.HOST_NAME,
        defaultMeta: defaultMeta(),
      });
    }

  }
  return log;
};

module.exports = logger;
