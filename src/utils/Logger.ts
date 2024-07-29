import fs from "fs";
import path from "path";

interface LoggerOptions {
  logFilePath?: string;
  logToConsole?: boolean;
}

export class Logger {
  private readonly context: string;
  private readonly logFilePath: string;
  private readonly logToConsole: boolean;

  constructor(context?: string, options: LoggerOptions = {}) {
    this.context = context || "Logger";
    this.logFilePath =
      options.logFilePath || path.resolve(__dirname, "logs.txt");
    this.logToConsole =
      options.logToConsole !== undefined ? options.logToConsole : true;
  }

  log(message: string): void {
    this.writeLog("INFO", message);
  }

  error(message: string): void {
    this.writeLog("ERROR", message);
  }

  warn(message: string): void {
    this.writeLog("WARN", message);
  }

  debug(message: string): void {
    this.writeLog("DEBUG", message);
  }

  private writeLog(level: string, message: string): void {
    const logMessage = `[${new Date().toISOString()}] ${level} (${
      this.context
    }): ${message}\n`;
    fs.appendFile(this.logFilePath, logMessage, (err) => {
      if (err) {
        console.error("Failed to write to log file", err);
      }
    });

    if (this.logToConsole) {
      console.log(logMessage);
    }
  }
}
