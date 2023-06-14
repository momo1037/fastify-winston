import type { FastifyLogFn, LogLevel } from "fastify";
import { serializers } from "fastify/lib/logger.js";
import {
  format,
  type LoggerOptions,
  type Logger as WinstonLogger,
  transports,
} from "winston";
import Logger from "winston/lib/winston/logger.js";

const LEVEL = Symbol.for("level");
const SPLAT = Symbol.for("splat");
const LEVELS: Record<LogLevel, number> = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
  silent: 6,
};
const COLORS: Record<string, string> = {
  fatal: "41", // red bg
  error: "31", // red
  warn: "33", // yellow
  info: "32", // green
  debug: "34", // blue
  trace: "90", // gray
};

export type FastifyWinstonLogger = Omit<
  WinstonLogger,
  LogLevel | "log" | "child"
> & {
  fatal: FastifyLogFn;
  error: FastifyLogFn;
  warn: FastifyLogFn;
  info: FastifyLogFn;
  debug: FastifyLogFn;
  trace: FastifyLogFn;
  silent: FastifyLogFn;
  log(level: LogLevel, ...args: unknown[]): void;
  child(meta: Record<string, unknown>): FastifyWinstonLogger;
};

export type FastifyWinstonLoggerOptions = LoggerOptions & {
  pretty?: boolean;
};

export const jsonFormat = format.combine(
  format.splat(),
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
  format.json()
);

export const prettyFormat = format.combine(
  format.metadata({ fillExcept: ["level", "message", "err"] }),
  format.splat(),
  format.timestamp({ format: "HH:mm:ss.SSS" }),
  format.printf((info) => {
    const str: string[] = [];

    str.push(`[${info.timestamp}]`);
    str.push(` \x1b[${COLORS[info.level]}m${info.level.toUpperCase()}\x1b[0m:`);

    if (info.message) str.push(` \x1b[36m${info.message}\x1b[0m`);

    if (Object.keys(info.metadata).length) {
      const json = JSON.stringify(info.metadata, null, 4)
        .split("\n")
        .slice(1, -1)
        .join("\n");

      str.push(`\n${json}`);
    }

    if (info.err) {
      const stack = (info.err.stack as string)
        .split("\n")
        .map((v) => `    ${v}`)
        .join("\n");

      str.push(`\n${stack}`);
    }

    return str.join("");
  })
);

export default function fastifyWinston(
  options: FastifyWinstonLoggerOptions = {}
): FastifyWinstonLogger {
  class DerivedLogger extends Logger {
    constructor(options: LoggerOptions) {
      super(options);
    }
  }

  const proto = DerivedLogger.prototype as unknown as FastifyWinstonLogger;

  proto.log = function (level, ...args) {
    const [arg0, arg1] = args;

    if (!arg0) return;

    let info: Record<string | symbol, unknown> = {};

    if (typeof arg0 === "string") {
      // format: message [...splat]
      info.message = arg0;
      info[SPLAT] = args.slice(1);
    } else {
      // format: meta [message] [...splat]
      info = arg0 as Record<string, unknown>;

      if (arg0 instanceof Error) info = { err: arg0, message: arg0.message };

      // serialize fastify req, res, err
      for (const key in info)
        if (serializers[key]) info[key] = serializers[key](info[key]);

      if (arg1) info.message = arg1;
      info[SPLAT] = args.slice(2);
    }

    info[LEVEL] = info.level = level;

    Object.assign(info, this.defaultMeta);

    this.write(info);
  };

  for (const level of Object.keys(LEVELS) as LogLevel[])
    proto[level] = function (...args: unknown[]) {
      this.log(level, ...args);
    };

  const { pretty, level, ...restOptions } = options;

  return new DerivedLogger({
    level,
    levels: LEVELS,
    format: pretty ? prettyFormat : jsonFormat,
    transports: new transports.Console(),
    silent: level === "silent",
    ...restOptions,
  }) as unknown as FastifyWinstonLogger;
}
