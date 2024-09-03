import chalk from "chalk";
import winston from "winston";

/**
 * Create a logger
 * @returns {winston.Logger}
 */
const createLogger = (): winston.Logger => {
  const customFormat = winston.format.printf((info) => {
    return `${chalk.blue(info.timestamp)} ${chalk.green(info.level)}: ${chalk.white(info.message)}`;
  });
  
  const devFormat = winston.format.combine(winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), customFormat);
  const prodFormat = winston.format.combine(winston.format.timestamp(), winston.format.json());
  const format = process.env.NODE_ENV !== "production" ? devFormat : prodFormat;

  const transports: winston.transport[] = [
    new winston.transports.File({ filename: "logs/error.log", level: "error", format: prodFormat }),
    new winston.transports.File({ filename: "logs/combined.log", format: prodFormat }),
    new winston.transports.Console({ format }),
  ];

  return winston.createLogger({
    level: "info",
    format,
    transports,
  });
};

/**
 * Logger used to log messages in the console and in a file
 * @constant
 * @type {winston.Logger}
 */
export const logger: winston.Logger = createLogger();
