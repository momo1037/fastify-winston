import { test } from 'node:test';
import assert from 'node:assert/strict';
import { transports, createLogger, format } from 'winston';
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

test('adapt external winston instance', () => {
  const { chunks, stream } = makeCapture();

  const external = createLogger({
    format: format.combine(format.splat(), format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }), format.json()),
    transports: new transports.Stream({ stream }),
  });

  const logger = fastifyWinston(external);
  logger.info('external works');

  const last = chunks[chunks.length - 1].trim();
  const obj = JSON.parse(last);
  assert.equal(obj.level, 'info');
  assert.equal(obj.message, 'external works');
});