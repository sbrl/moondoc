"use strict";

import fs from 'fs';
import path from 'path';

import pretty_ms from 'pretty-ms';

import log from './io/NamespacedLog.mjs'; const l = log("build");
import parse_directory from './parse/parse_directory.mjs';
import make_site from './generate/make_site.mjs';

// HACK: Make sure __dirname is defined when using es6 modules. I forget where I found this - a PR with a source URL would be great!
const __dirname = import.meta.url.slice(7, import.meta.url.lastIndexOf("/"));

export default async function (dirpath_in, options, software=null, branch="__AUTO__", project_name=null) {
	l.log(`Starting build`);
	
	let time_parse = new Date();
	const api = await parse_directory(dirpath_in, software, branch);
	time_parse = pretty_ms(new Date() - time_parse);
	
	l.log(`Parsed in ${time_parse}`);
	
	
	let time_render = new Date();
	const result = await make_site({
		site: project_name ?? path.basename(dirpath_in),
		package: JSON.parse(await fs.promises.readFile(path.join(__dirname, "../../package.json"), "utf-8")),
		
		api
	}, options);
	time_render = pretty_ms(new Date() - time_render);
	
	l.log(`Rendered in ${time_render}`);
	
	return result;
}