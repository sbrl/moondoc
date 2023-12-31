#!/usr/bin/env node
"use strict";

import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

import esbuild from 'esbuild';

import log from '../lib/io/NamespacedLog.mjs'; const l = log("esbuild");


const __dirname = import.meta.url.slice(7, import.meta.url.lastIndexOf("/"));
const outdir = path.resolve(__dirname, "./_dist");

function make_context() {
	return {
		entryPoints: [
			"./js/index.mjs",
			// "./index.css",
		].map(filepath => path.resolve(__dirname, filepath)),
		outdir,
		bundle: true,
		minify: typeof process.env.NO_MINIFY === "undefined",
		sourcemap: true,
		treeShaking: true,
		loader: {
			".html": "text",
		},
		external: ["fs", "path"],
		plugins: [
			{
				name: "print",
				setup(build) {
					build.onEnd(_result => {
						console.log(`${new Date().toISOString()} | Build complete`);
					})
				}
			}
		]
	};
}

(async () => {
	"use strict";
	switch (process.env.ES_MODE ?? "build") {
		case "build":
			const result = await esbuild.build(make_context());
			if (result.errors.length > 0 || result.warnings.length > 0)
				l.error(result);
			break;

		case "watch":
			const ctx = await esbuild.context(make_context());
			await ctx.watch();
			l.log(`>>> Watching for changes`);
			break;
	}
	
	// l.log(await esbuild.analyzeMetafile(result.metafile));
})();

