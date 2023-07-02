"use strict";

import fs from 'fs';

import settings from '../settings.mjs';
import parse_file from '../lib/parse/parse_file.mjs';

export default async function() {
	if(typeof(settings.cli.input) !== "string")
		throw new Error(`Error: No input file specified via the --input argument.`);
	
	const content = await fs.promises.readFile(settings.cli.input);
	
	console.log(parse_file(content));
}