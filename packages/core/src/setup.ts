import type { Constructable } from '@nestify-js/shared';

import { PipeBody } from './pipes/body.pipe.js';
import { PipeParams } from './pipes/params.pipe.js';
import { PipeIp } from './pipes/ip.pipe.js';
import { PipeQuery } from './pipes/query.pipe.js';
import { PipeRaw } from './pipes/raw.pipe.js';

/**
 * Register basic pipe instances into the injector.
 * Called during `apply()` via the `setup` callback.
 *
 * @param register Function to register a class as an auto-created instance
 */
export function setupBasicPipes(register: (cls: Constructable) => void) {
  register(PipeBody);
  register(PipeParams);
  register(PipeIp);
  register(PipeQuery);
  register(PipeRaw);
}
