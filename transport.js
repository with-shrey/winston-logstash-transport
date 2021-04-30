const dgram = require('dgram')
const os = require('os')

const winston = require('winston')

/* eslint-disable no-empty-function */
function noop() {
}
/* eslint-enable no-empty-function */

class LogstashTransport extends winston.Transport {
  constructor(options) {
    options = options || {}

    super(options)

    this.name = 'LogstashTransport'

    this.host = options.host
    this.port = options.port
    this.trailingLineFeed = options.trailingLineFeed === true
    this.trailingLineFeedChar = options.trailingLineFeedChar || os.EOL
    this.silent = options.silent

    this.client = null

    this.connect()
  }

  connect() {
    this.client = dgram.createSocket('udp4')
    this.client.unref()
  }

  log(info, callback) {
    if (this.silent) {
      return callback(null, true)
    }

    this.send(info[Symbol.for('message')], (err) => {
      this.emit('logged', !err)
      callback(err, !err)
    })
  }

  send(message, callback) {
    if (this.trailingLineFeed === true) {
      message = message.replace(/\s+$/, '') + this.trailingLineFeedChar
    }

    const buf = Buffer.from(message)
    this.client.send(buf, 0, buf.length, this.port, this.host, (callback || noop))
  }
}

function createLogger(logType, config) {
  const appendMetaInfo = winston.format((info) => {
    return Object.assign(info, {
      application: logType || config.application,
      hostname: config.hostname || os.hostname(),
      pid: process.pid,
      time: new Date(),
    })
  });


  /**
   * Winston by default doesn't support printing javascript
   * error object. This function configures winston to print
   * javascript objects
   * Reference: https://github.com/winstonjs/winston/issues/1338#issuecomment-403289827
   * @type {any}
   */
  const print = winston.format((info) => {
    let log = {
      message: '',
      extra: {}
    };
    let infoKeys = Object.keys(info);
    for (let i = 0; i < infoKeys.length; i++) {
      if (info[infoKeys[i]] instanceof Error) {
        log.error = info[infoKeys[i]].message;
        log.stack = info[infoKeys[i]].stack;
      }
      else if (infoKeys[i] === 'message') {
        log.message = info[infoKeys[i]]
      }
      else {
        log.extra[infoKeys[i]] = JSON.stringify(info[infoKeys[i]])
      }
    }
    return log;
  });

  return winston.createLogger({
    level: config.level || 'info',
    format: winston.format.combine(
        appendMetaInfo(),
        print(),
        winston.format.timestamp()
    ),
    transports: [
      new LogstashTransport(config.logstash)
    ].concat(config.transports || [])
  })
}

exports.LogstashTransport = LogstashTransport
exports.createLogger = createLogger
