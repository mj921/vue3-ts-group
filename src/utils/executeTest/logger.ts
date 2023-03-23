import { dateFmt } from '..';

enum LEVEL {
  DEBUG = 1,
  ERROR = 2,
  WARN = 3,
  INFO = 4,
  SUCCESS = 5,
}
export default class Logger {
  static LEVEL = LEVEL;
  static DEBUG = LEVEL.DEBUG;
  static ERROR = LEVEL.ERROR;
  static WARN = LEVEL.WARN;
  static INFO = LEVEL.INFO;
  static SUCCESS = LEVEL.SUCCESS;
  static LEVEL_NAME = {
    [LEVEL.DEBUG]: 'debug',
    [LEVEL.ERROR]: 'error',
    [LEVEL.WARN]: 'warn',
    [LEVEL.INFO]: 'info',
    [LEVEL.SUCCESS]: 'success',
  };
  static LEVEL_COLOR = {
    [LEVEL.DEBUG]: 'blue',
    [LEVEL.ERROR]: 'red',
    [LEVEL.WARN]: 'yellow',
    [LEVEL.INFO]: 'black',
    [LEVEL.SUCCESS]: 'green',
  };
  static log(msg: any, level = LEVEL.INFO, color?: string[]) {
    if (!Array.isArray(msg)) {
      msg = [msg];
    }
    let content: any[] = [];
    if (color) {
      content = [`[${dateFmt('yyyy-MM-dd HH:mm:ss')}_log]:`, ...color];
    } else {
      content = [
        `%c[${dateFmt('yyyy-MM-dd HH:mm:ss')}_${Logger.LEVEL_NAME[level]}]:`,
        'color:' + Logger.LEVEL_COLOR[level],
      ];
    }
    msg.forEach((el: any) => {
      if (typeof el === 'object' && el !== null) {
        content.push(el);
        content[0] += JSON.stringify(el);
      } else {
        content[0] += el.toString();
      }
    });
    console.log(...content);
  }
  log(msg: any, level: LEVEL, color?: string[]) {
    Logger.log(msg, level, color);
  }
  static debug(msg: any) {
    Logger.log(msg, LEVEL.DEBUG);
  }
  static error(msg: any) {
    Logger.log(msg, LEVEL.ERROR);
  }
  static warn(msg: any) {
    Logger.log(msg, LEVEL.WARN);
  }
  static info(msg: any, color?: string[]) {
    Logger.log(msg, LEVEL.INFO, color);
  }
  static success(msg: any) {
    Logger.log(msg, LEVEL.SUCCESS);
  }
  debug(msg: any) {
    this.log(msg, LEVEL.DEBUG);
  }
  error(msg: any) {
    this.log(msg, LEVEL.ERROR);
  }
  warn(msg: any) {
    this.log(msg, LEVEL.WARN);
  }
  info(msg: any, color?: string[]) {
    this.log(msg, LEVEL.INFO, color);
  }
  success(msg: any) {
    this.log(msg, LEVEL.SUCCESS);
  }
}
