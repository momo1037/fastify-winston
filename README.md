# fastify-winston

![](https://img.shields.io/badge/module_type-ESM_only-brightgreen)
[![](https://img.shields.io/npm/v/fastify-winston)](https://www.npmjs.com/package/fastify-winston)
![](https://img.shields.io/node/v/fastify-winston)
![](https://img.shields.io/npm/dependency-version/fastify-winston/peer/fastify)
![](https://img.shields.io/npm/dependency-version/fastify-winston/peer/winston)
![](https://img.shields.io/npm/types/fastify-winston)
![](https://img.shields.io/npm/l/fastify-winston)

## Install

```bash
npm i fastify-winston winston
```

## Usage

### Compatibility

- v1.x supports `fastify@4`
- v2.x supports `fastify@5`

```js
import fastify from "fastify";
import fastifyWinston from "fastify-winston";

// Fastify v5: use loggerInstance
const app = fastify({
  loggerInstance: fastifyWinston({ pretty: true }),
});

app.log.info("hello world");
await app.listen({ port: 3000 });
```

### Fastify v4

```js
import fastify from "fastify";
import fastifyWinston from "fastify-winston";

const app = fastify({
  logger: fastifyWinston({ pretty: true }),
});

app.log.info("hello world");
await app.listen({ port: 3000 });
```

### Use an existing Winston instance

```js
import fastify from "fastify";
import { createLogger, format, transports } from "winston";
import fastifyWinston from "fastify-winston";

const win = createLogger({
  levels: { fatal: 0, error: 1, warn: 2, info: 3, debug: 4, trace: 5, silent: 6 },
  format: format.combine(format.splat(), format.timestamp(), format.json()),
  transports: new transports.Console(),
});

const app = fastify({
  loggerInstance: fastifyWinston(win),
});

app.log.info("hello from external winston");
await app.listen({ port: 3000 });
```

## License

Licensed under MIT.
