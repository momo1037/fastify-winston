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

test('child logger inherits methods and merges defaultMeta', () => {
  const { chunks, stream } = makeCapture();
  const logger = fastifyWinston({
    level: 'info',
    transports: new transports.Stream({ stream }),
    defaultMeta: { service: 'api' },
  });

  const child = logger.child({ route: '/v1' });
  child.info('child message');

  const last = chunks[chunks.length - 1].trim();
  const obj = JSON.parse(last);
  assert.equal(obj.level, 'info');
  assert.equal(obj.message, 'child message');
  assert.equal(obj.service, 'api');
  assert.equal(obj.route, '/v1');
});