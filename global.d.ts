declare module "fastify/lib/logger.js" {
  export const serializers: {
    [key: string]: (v: any) => any;
  };
}

declare module "winston/lib/winston/logger.js" {
  import { Logger } from "winston";
  export default Logger;
}
