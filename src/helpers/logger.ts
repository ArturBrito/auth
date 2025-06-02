import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import morgan from 'morgan';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Configuration
const LEVEL_PADDING_CONSOLE = 15;
const LEVEL_PADDING_FILE = 8;
const PATH = 'logs'

// Custom format with alignment
const alignedFormatConsole = printf(({ level, message, timestamp, stack }) => {
    const paddedLevel = level.padEnd(LEVEL_PADDING_CONSOLE, ' ');
    const paddedMessage = (stack || message).toString();
    return `${paddedLevel}: [${timestamp}] ${paddedMessage}`;
});

const alignedFormatFile = printf(({ level, message, timestamp, stack }) => {
    const paddedLevel = level.padEnd(LEVEL_PADDING_FILE, ' ');
    const paddedMessage = (stack || message).toString();
    return `${paddedLevel}: [${timestamp}] ${paddedMessage}`;
});

// Transport for rotating log files
const fileRotateTransport = new DailyRotateFile({
    filename: `${PATH}/auth-%DATE%.log`,
    maxFiles: '5d',
    zippedArchive: true,
    maxSize: '20m',
});

// Create logger instance
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
        timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        errors({ stack: true }),
        alignedFormatFile
    ),
    transports: [
        // Console transport with colors
        new winston.transports.Console({
            format: combine(
                colorize(),
                alignedFormatConsole
            ),
        }),
        fileRotateTransport,
    ],
    exceptionHandlers: [
        //new winston.transports.File({ filename: 'logs/exceptions.log' }),
        new DailyRotateFile({
            filename: `${PATH}/exceptions-%DATE%.log`,
            maxFiles: '5d',
            zippedArchive: true,
            maxSize: '20m',
        })
    ],
    rejectionHandlers: [
        //new winston.transports.File({ filename: 'logs/rejections.log' }),
        new DailyRotateFile({
            filename: `${PATH}/rejections-%DATE%.log`,
            maxFiles: '5d',
            zippedArchive: true,
            maxSize: '20m',
        })
    ],
});

// Custom logger interface
export const log = {
    info: (message: string | object, meta?: any) => {
        logger.info(formatMessage(message), meta);
    },
    warn: (message: string | object, meta?: any) => {
        logger.warn(formatMessage(message), meta);
    },
    error: (message: string | object, meta?: any) => {
        logger.error(formatMessage(message), meta);
    },
    debug: (message: string | object, meta?: any) => {
        logger.debug(formatMessage(message), meta);
    },
    /*verbose: (message: string | object, meta?: any) => {
        logger.verbose(formatMessage(message), meta);
    },*/
};

// Helper to format objects to strings
const formatMessage = (message: string | object): string => {
    return typeof message === 'object'
        ? JSON.stringify(message, null, 2)
        : message;
};

export default log;


const morganLogger = winston.createLogger({
    level: 'http',
    format: combine(
        timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        errors({ stack: true }),
        alignedFormatFile
    ),
    transports: [new winston.transports.Console({
        format: combine(
            colorize(),
            alignedFormatConsole
        ),
    })],
});

const morganMiddleware = morgan(
    ':method :url :status - :response-time ms',
    {
        stream: {
            write: (message: string) => morganLogger.http(message.trim()),
        },
    },
);

export { morganMiddleware };