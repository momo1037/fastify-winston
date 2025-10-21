import { test } from 'node:test';
import assert from 'node:assert/strict';
import { transports } from 'winston';
import { Writable } from 'node:stream';
import fastifyWinston from '../mod.js';

function makeCapture() {
  const chunks = [];
  const stream = new Writable({
    write(chunk, _enc, cb) {
      chunks.push(chunk.toString());
      cb();
    },
  });
  return { chunks, stream };
}

test('json format: info message with splat', () => {
  const { chunks, stream } = makeCapture();
  const logger = fastifyWinston({
    level: 'info',
    transports: new transports.Stream({ stream }),
    // pretty disabled => jsonFormat
  });

  logger.info('hello %s', 'world');

  assert.ok(chunks.length >= 1);
  const last = chunks[chunks.length - 1].trim();
  const obj = JSON.parse(last);
  assert.equal(obj.level, 'info');
  assert.equal(obj.message, 'hello world');
  assert.ok(typeof obj.timestamp === 'string');
});

test('json format: error with meta and message', () => {
  const { chunks, stream } = makeCapture();
  const logger = fastifyWinston({
    level: 'info',
    transports: new transports.Stream({ stream }),
  });

  logger.error({ foo: 'bar' }, 'oops');

  const last = chunks[chunks.length - 1].trim();
  const obj = JSON.parse(last);
  assert.equal(obj.level, 'error');
  assert.equal(obj.message, 'oops');
  assert.equal(obj.foo, 'bar');
});

test('silent level: no output', () => {
  const { chunks, stream } = makeCapture();
  const logger = fastifyWinston({
    level: 'silent',
    transports: new transports.Stream({ stream }),
  });

  logger.info('should not log');
  logger.error('should not log');

  assert.equal(chunks.length, 0);
});

test('trace level method exists and logs', () => {
  const { chunks, stream } = makeCapture();
  const logger = fastifyWinston({
    level: 'trace',
    transports: new transports.Stream({ stream }),
  });

  logger.trace('trace message');

  const last = chunks[chunks.length - 1].trim();
  const obj = JSON.parse(last);
  assert.equal(obj.level, 'trace');
  assert.equal(obj.message, 'trace message');
});