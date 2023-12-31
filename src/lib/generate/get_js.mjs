"use strict";

import fs from 'fs';
import path from 'path';


import log from '../io/NamespacedLog.mjs'; const l = log("make_js");

// HACK: Make sure __dirname is defined when using es6 modules. I forget where I found this - a PR with a source URL would be great!
const __dirname = import.meta.url.slice(7, import.meta.url.lastIndexOf("/"));

export default async function(include_sourcemap) {
	const filepath_js = path.resolve(__dirname, "../../templates/_dist/index.js");
	const filepath_js_map = path.resolve(__dirname, "../../templates/_dist/index.js.map");
	
	if(!fs.existsSync(filepath_js)) {
		throw new Error(`Error: Failed to find the client-side JS to embed at '${filepath_js} because it doesn't exist. Have you run esbuild? If this is the moondoc npm package, this is a bug as esbuild does NOT need installing - it is run before packaging.`);
	}
	
	if(include_sourcemap && !fs.existsSync(filepath_js_map)) {
		l.warn(`Found client-side JS, but failed to find source map for inclusion - ignoring. Source map inclusion is a debugging feature. To use this option, clone the git repo: <https://github.com/sbrl/moondoc>`);
		include_sourcemap = false;
	}
	
	// TODO handle error messages instead of using fs.existsSync for more robustness
	
	let js = (await fs.promises.readFile(filepath_js, "utf-8"))
		.replace(/\/\/#\s*sourceMappingURL=\S+/, "")
		.trim();
	
	if(include_sourcemap) {
		const sourcemap = await fs.promises.readFile(filepath_js_map, "utf-8");
		
		js += `\n//# sourceMappingURL=data:application/json;base64,${Buffer.from(sourcemap).toString("base64")}\n//# sourceURL=inline-index.js`;
	}
	
	return js;
}