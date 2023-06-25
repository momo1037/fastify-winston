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

```js
import fastify from "fastify";
import fastifyWinston from "fastify-winston";

const app = fastify({
  logger: fastifyWinston({ pretty: true }),
});

app.log.info("hello world");
app.listen();
```

## License

Licensed under MIT.
