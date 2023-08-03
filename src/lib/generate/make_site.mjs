"use strict";

import fs from 'fs';
import path from 'path';

import log from '../io/NamespacedLog.mjs'; const l = log("make_site");
import nunjucks from 'nunjucks';
import CleanCSS from 'clean-css';
import { minify as clean_html } from 'html-minifier-terser';
import nunjucks_markdown from 'nunjucks-markdown';

import markdown2html from '../parse/markdown2html.mjs';

// HACK: Make sure __dirname is defined when using es6 modules. I forget where I found this - a PR with a source URL would be great!
const __dirname = import.meta.url.slice(7, import.meta.url.lastIndexOf("/"));

async function get_css(minify=false) {
	const css = await fs.promises.readFile(
		path.join(__dirname, "../../templates/index.css")
	);
	if(minify) return new CleanCSS({ level: 2 }).minify(css);
	else return { styles: css };
}

export default async function make_site(root) {
	root.css = await get_css(true);
	if(root.css.stats)
		l.log(`CSS minified, reducing size by ${(root.css.stats.efficiency * 100).toFixed(2)}%`);
	
	l.debug(`Templates root is at '${path.join(__dirname, "../../templates")}'`);
	const env = nunjucks.configure(
		path.join(__dirname, "../../templates"),
		{ autoescape: true }
	);
	
	nunjucks_markdown.register(env, markdown2html);
	
	// console.log(root);
	
	const result = nunjucks.render("index.njk", root);
	const result_min = await clean_html(result, {
		collapseWhitespace: true,
		removeComments: true,
		decodeEntities: true,
		removeEmptyAttributes: true,
		collapseBooleanAttributes: true,
		removeRedundantAttributes: true,
		removeScriptTypeAttributes: true,
		removeStyleLinkTypeAttributes: true,
		sortAttributes: true,
		sortClassName: true,
		useShortDoctype: true
	});
	
	l.log(`HTML minified, reducing size by ${((1 - (result_min.length/result.length))*100).toFixed(2)}%`);
	
	return result_min;
}