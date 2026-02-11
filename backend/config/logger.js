import pino from "pino";

const isProd = process.env.NODE_ENV === "production";

const logger = isProd
  ? pino() // plain logger for Vercel / prod
  : pino({
      transport: {
        target: "pino-pretty",
        options: { colorize: true },
      },
    });

export default logger;
