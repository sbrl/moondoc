"use strict";

import fs from 'fs';
import path from 'path';

import log from '../io/NamespacedLog.mjs'; const l = log("make_site");
import nunjucks from 'nunjucks';
import CleanCSS from 'clean-css';

// HACK: Make sure __dirname is defined when using es6 modules. I forget where I found this - a PR with a source URL would be great!
const __dirname = import.meta.url.slice(7, import.meta.url.lastIndexOf("/"));

async function get_css() {
	return new CleanCSS({
		level: 2
	}).minify(await fs.promises.readFile(
		path.join(__dirname, "../../templates/index.css")
	));
}

export default async function make_site(root) {
	root.css = await get_css();
	l.log(`CSS minified, reducing size by ${(root.css.stats.efficiency * 100).toFixed(2)}%`);
	
	l.debug(`Templates root is at '${path.join(__dirname, "../../templates")}'`);
	nunjucks.configure(
		path.join(__dirname, "../../templates"),
		{ autoescape: true }
	);
	
	console.log(root);
	
	return nunjucks.render("index.njk", root);
}