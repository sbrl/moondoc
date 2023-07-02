"use strict";

import fs from 'fs';
import util from 'util';

import settings from '../../settings.mjs';
import parse_directory from '../../lib/parse/parse_directory.mjs';

export default async function() {
	if(typeof(settings.cli.input) !== "string")
		throw new Error(`Error: No input directory specified via the --input argument.`);
	
	
	
	const result = await parse_directory(settings.cli.input);
	// console.log(util.inspect(result, false, 10, true));
	console.log(JSON.stringify(result));
}