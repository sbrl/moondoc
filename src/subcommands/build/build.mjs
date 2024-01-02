"use strict";

import fs from 'fs';

import log from '../../lib/io/NamespacedLog.mjs'; const l = log("build");
import settings from "../../settings.mjs";
import { write_safe, end_safe } from '../../lib/io/StreamHelpers.mjs';

import do_build from '../../lib/do_build.mjs';



export default async function() {
	const stream_out = settings.cli.output === null ? process.stdout : fs.createWriteStream(settings.cli.output);
	
	
	await write_safe(stream_out, await do_build(
		settings.cli.input,
		{
			css_minify: !settings.cli.debug_nominify,
			js_sourcemap: settings.cli.debug_sourcemaps,
			html_minify: !settings.cli.debug_nominify
		},
		settings.cli.software,
		settings.cli.branch
	));
	await end_safe(stream_out);
	
	l.log(`Written to ${settings.cli.output === null ? `stdout` : settings.cli.output}`);
}