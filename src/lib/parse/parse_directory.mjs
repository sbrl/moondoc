"use strict";

import fs from 'fs';
import path from 'path';

import { glob } from 'glob';
import as_table from 'as-table';
import { codeToHtml } from 'shiki';

import log from '../io/NamespacedLog.mjs'; const l = log("parse_dir");

import parse_file from './parse_file.mjs';
import git_make_web_uri from '../io/git_make_web_uri.mjs';

const collator = new Intl.Collator();

function make_namespace(name) {
	return {
		type: "namespace",
		namespace: name,
		children: [],
		functions: [],
		events: [],
		values: []
	}
}

function find_namespace(api, namespace) {
	if(namespace == "null") return api;
	const parts = namespace.split(".");
	let current = api;
	for(const part of parts) {
		if(part.length == 0) continue;
		let found = false;
		for(const child of current.children) {
			if(child.namespace !== part) continue;
			current = child;
			found = true;
			break;
		}
		if(!found) {
			const sub_ns = make_namespace(part);
			current.children.push(sub_ns);
			current.children.sort((a, b) => {
				return collator.compare(a.namespace, b.namespace);
			});
			current = sub_ns;
		}
	}
	return current;
}

async function group_by_namespace(definitions, dirpath_repo, software=null, branch="__AUTO__") {
	const result = make_namespace(".");
	
	for(const filename in definitions) {
		const definition = definitions[filename];
		
		let namespace_name = definition.namespace, current = result;
		for(const block of definition.blocks) {
			block.filename = filename;
			switch(block.type) {
				case "namespace":
					current = find_namespace(result, block.namespace);
					current.def = block;
					current.url = await git_make_web_uri(dirpath_repo, current.def.filename, software, branch, current.def.line, current.def.line_last);
					break;
				
				case "class":
					current = find_namespace(result, block.namespace);
					current.type = "class";
					current.def = block;
					current.url = await git_make_web_uri(dirpath_repo, current.def.filename, software, branch, current.def.line, current.def.line_last);
					l.log(`🏠 CLASS ${block.namespace}`);
					l.debug(`CLASSDEF`, current);
					break;
				
				case "event":
					current.events.push(block);
					current.events.sort((a, b) => collator.compare(a.event, b.event));
					break;
				case "function":
					if(block.namespace)
						current = find_namespace(result, block.namespace);
					block.url = await git_make_web_uri(dirpath_repo, block.filename, software, branch, block.line, block.line_last);
					current.functions.push(block);
					l.log(`📦 FUNCTION ${block.namespace} >> ${block.name}`);
					current.functions.sort((a, b) => collator.compare(a.name, b.name));
					break;
				
				case "value":
					current.values.push(block);
					break;
				
				default:
					throw new Error(`Error: Unknown block type '${block.type}'.`);
			}
			
			block.__self = await codeToHtml(JSON.stringify(block, null, `\t`), {
				lang: `json`,
				theme: `vitesse-dark`
			});
		}
	}
	
	return result;
}

export default async function(dirpath, software=null, branch="__AUTO__") {
	const filepaths_lua = await glob(path.join(dirpath, "**/*.lua"), {
		ignore: [ '.*/**' ]
	});
	
	const result = {};
	const to_display = [];
	
	for(const filepath of filepaths_lua) {
		l.debug(`FILE ${filepath}`);
		
		const relative = path.relative(dirpath, filepath);
		
		const source = await fs.promises.readFile(filepath, "utf-8");
		
		result[relative] = await parse_file(source);
		
		to_display.push({filepath: relative, blocks: result[relative].blocks.length});
	}
	to_display.sort((a, b) => a.filepath.localeCompare(b.filepath));
	l.log(`Blocks report:`);
	l.log(`\n${as_table(to_display)}`);
	
	const api = await group_by_namespace(result, dirpath, software, branch);
	
	return api;
}