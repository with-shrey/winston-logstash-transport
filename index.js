const winston = require('winston');
const LogstashTransport = require('./transport');
const LOG_LEVEL = process.env.LOG_LEVEL || 'debug';
const NODE_ENV = process.env.NODE_ENV || 'development';
const SEND_TO_LOGSTASH = process.env.SEND_TO_LOGSTASH;

/**
 * Winston by default doesn't support printing javascript
 * error object. This function configures winston to print
 * javascript objects
 * Reference: https://github.com/winstonjs/winston/issues/1338#issuecomment-403289827
 * @type {any}
 */
const print = winston.format((info) => {

  let infoKeys = Object.keys(info);
  for (let i = 0; i < infoKeys.length; i++) {
    if (info[infoKeys[i]] instanceof Error) {
      info.error = info[infoKeys[i]].message;
      info.stack = info[infoKeys[i]].stack;
    }
  }
  return info;
});

const logger = function (scope) {

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
  let log;
  if (NODE_ENV === 'development') {
    log = winston.createLogger({
          level: LOG_LEVEL,
          defaultMeta: {scope: scope, application: process.env.APPLICATION_NAME},
          transports: [
            new winston.transports.Console({
              format: winston.format.combine(
                  print(),
                  winston.format.colorize(),
                  winston.format.simple(),
              ),
            })
          ]
        }
    );
  }
  else if (NODE_ENV === 'staging' || NODE_ENV === 'production') {
    if (!SEND_TO_LOGSTASH) {
      log = winston.createLogger({
            level: LOG_LEVEL,
            defaultMeta: {scope: scope, application: process.env.APPLICATION_NAME},
            transports: [
              new winston.transports.Console({
                format: winston.format.combine(
                    print(),
                    winston.format.json()
                ),
              })
            ]
          }
      );
    }
    else {
      log = LogstashTransport.createLogger(null, {
        level: LOG_LEVEL,
        logstash: {
          host: process.env.LOGSTASH_SERVER_IP,
          port: process.env.LOGSTASH_PORT
        },
        application: process.env.APPLICATION_NAME,
        hostname: process.env.HOST_NAME,
        format: winston.format.combine(
            print(),
            winston.format.simple(),
            winston.format.json(),
            winston.format.timestamp(),
        ),
        defaultMeta: {scope: scope},
      });
    }

  }
  return log;
};

module.exports = logger;
