# winston-logstash-transporter

Writes logs to logstash using UDP, or to console for development environment.

In production or staging, logstash can be switched with a file based logging that rotates files based on the following rules:

https://github.com/winstonjs/winston-daily-rotate-file

* default directory: `/var/log/<process.env.APPLICATION_NAME>`

* filename format: `default-%DATE%.log`

* maxFileSize: `20mb`

* Maximum time to keep log files: `7 days` 


Fixes winston issue for logging Javascript error object 
https://github.com/winstonjs/winston/issues/1338

## Example

```js

const logger = require('winston-logstash-transporter')(__filename);

logger.info({
  message: 'Some message here',
  data,
  functionName: 'blah'
});

logger.debug({
  message: 'Some message here',
  data: {
    blah: 'blah'
  }
});

logger.error({
  message: 'Some message here',
  error
});
```


## Environment Variables

* LOG_LEVEL = `error | warn | info | http | verbose | debug | silly` `[default = debug]`

* NODE_ENV = `development | staging | production` `[default = development]`

* SEND_TO_LOGSTASH = `true | false` `[default = false]`

* APPLICATION_NAME = `your_app_name`
 
* LOGSTASH_SERVER_IP = `xxx.xxx.xxx.xxx`

* LOGSTASH_PORT = `xxxx`

* HOST_NAME = `host_name`
