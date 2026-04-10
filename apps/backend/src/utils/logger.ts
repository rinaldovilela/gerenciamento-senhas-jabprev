const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

class Logger {
  private level: keyof typeof LOG_LEVELS = 'INFO';

  setLevel(level: keyof typeof LOG_LEVELS) {
    this.level = level;
  }

  private formatLog(level: string, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const baseMessage = `[${timestamp}] [${level}] ${message}`;
    return data ? `${baseMessage} | ${JSON.stringify(data)}` : baseMessage;
  }

  debug(message: string, data?: any) {
    if (this.canLog('DEBUG')) {
      console.log(this.formatLog('🔵 DEBUG', message, data));
    }
  }

  info(message: string, data?: any) {
    if (this.canLog('INFO')) {
      console.log(this.formatLog('🟢 INFO', message, data));
    }
  }

  warn(message: string, data?: any) {
    if (this.canLog('WARN')) {
      console.warn(this.formatLog('🟡 WARN', message, data));
    }
  }

  error(message: string, error?: Error | any) {
    if (this.canLog('ERROR')) {
      const errorData = error instanceof Error ? error.message : JSON.stringify(error);
      console.error(this.formatLog('🔴 ERROR', message, errorData));
    }
  }

  private canLog(level: string): boolean {
    const levels = Object.keys(LOG_LEVELS);
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }
}

export const logger = new Logger();
