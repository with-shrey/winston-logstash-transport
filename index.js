const winston = require('winston');
const LogstashTransport = require('./transport');
require('winston-daily-rotate-file');
const LOG_LEVEL = process.env.LOG_LEVEL || 'debug';
const NODE_ENV = process.env.NODE_ENV || 'development';
const SEND_TO_LOGSTASH = process.env.SEND_TO_LOGSTASH === 'true';
let APPLICATION_NAME = process.env.APPLICATION_NAME || 'winston-logstash-transporter';
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
      application: APPLICATION_NAME,
      get time() {
        return moment().format();
      }
    }
  };
  if (NODE_ENV === 'development') {
    log = winston.createLogger({
          level: LOG_LEVEL,
          defaultMeta: defaultMeta(),
          transports: [
            new winston.transports.Console({
              format: winston.format.combine(
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
      let logDirectory = `/var/log/${APPLICATION_NAME}/application_log`;
      log = winston.createLogger({
            level: LOG_LEVEL,
            defaultMeta: defaultMeta(),
            format: print,
            transports: [
              new winston.transports.DailyRotateFile({
                dirname: logDirectory,
                filename: 'default-%DATE%.log',
                datePattern: 'YYYY-MM-DD-HH',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '7d'
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
        application: APPLICATION_NAME,
        hostname: process.env.HOST_NAME,
        defaultMeta: defaultMeta(),
      });
    }
  }
  return log;
};

module.exports = logger;
