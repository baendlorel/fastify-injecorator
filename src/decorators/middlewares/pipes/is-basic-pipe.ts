import { PipeBody } from './body.pipe.js';
import { PipeIp } from './ip.pipe.js';
import { PipeParams } from './params.pipe.js';
import { PipeQuery } from './query.pipe.js';
import { PipeRaw } from './raw.pipe.js';

export function isBasicPipe(pipe: unknown): pipe is Class {
  return (
    pipe === PipeBody ||
    pipe === PipeParams ||
    pipe === PipeIp ||
    pipe === PipeRaw ||
    pipe === PipeQuery
  );
}
