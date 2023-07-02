"use strict";

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import log from '../io/NamespacedLog.mjs'; const l = log("parse");

import parse_file from './parse_file.mjs';

export default async function(dirpath) {
	const filepaths_lua = await glob(path.join(dirpath, "**/*.lua"), {
		ignore: [ '.*/**' ]
	});
	
	const result = {};
	
	for(const filepath of filepaths_lua) {
		l.log(`FILE ${filepath}`);
		
		const relative = path.relative(dirpath, filepath);
		
		const source = await fs.promises.readFile(filepath, "utf-8");
		
		result[relative] = parse_file(source);
	}
	
	return result;
}