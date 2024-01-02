"use strict";

import do_build from "./lib/do_build.mjs";
import { log as l, LOG_LEVELS } from './lib/io/Log.mjs';

l.level = LOG_LEVELS.INFO;

function log_level(level) {
	const level_code = LOG_LEVELS[level.toUpperCase()];
	if(level_code)
		l.level = level_code;
	else
		throw new Error(`Error: Unknown log level ${level}. Possible values: ${Object.keys(LOG_LEVELS).join(", ")}`);
}

export default do_build;
export {
	do_build as build,
	log_level
};