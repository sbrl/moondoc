"use strict";

import fs from 'fs';
// import util from 'util';

import settings from '../../settings.mjs';
import parse_file from '../../lib/parse/parse_file.mjs';

export default async function() {
	if(typeof(settings.cli.input) !== "string")
		throw new Error(`Error: No input file specified via the --input argument.`);
	
	const content = await fs.promises.readFile(settings.cli.input, "utf-8");
	console.error(`DEBUG:content`, content);
	
	const result = parse_file(content);
	// console.log(util.inspect(result, false, 10, true));
	console.log(JSON.stringify(result));
}