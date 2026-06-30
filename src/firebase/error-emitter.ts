/**
 * @fileOverview Centralized error emitter for Firebase permission errors.
 */

import { EventEmitter } from 'events';

class ErrorEmitter extends EventEmitter {}

export const errorEmitter = new ErrorEmitter();
