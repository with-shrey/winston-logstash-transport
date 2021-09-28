exports.LOG_LEVEL = process.env.LOG_LEVEL || 'debug';
exports.NODE_ENV = process.env.NODE_ENV || 'development';
exports.SEND_TO_LOGSTASH = process.env.SEND_TO_LOGSTASH === 'true';
exports.SEND_TO_FILE = process.env.SEND_TO_FILE === 'true';
exports.SEND_TO_STDOUT = process.env.SEND_TO_STDOUT === 'true';
exports.APPLICATION_NAME = process.env.APPLICATION_NAME || 'winston-logstash-transporter';
exports.HOST_NAME = process.env.HOST_NAME;
exports.LOGSTASH_SERVER_IP = process.env.LOGSTASH_SERVER_IP;
exports.LOGSTASH_PORT = process.env.LOGSTASH_PORT;
