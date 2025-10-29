import { Injectable } from '../../../src/decorators/injectable.js';

@Injectable()
export class LoggerService {
  private logs: string[] = [];

  log(message: string) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    this.logs.push(logEntry);
    console.log(logEntry);
  }

  getLogs(): string[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}
