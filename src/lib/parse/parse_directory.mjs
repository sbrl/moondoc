"use strict";

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import log from '../io/NamespacedLog.mjs'; const l = log("parse");

import parse_file from './parse_file.mjs';
import git_make_web_uri from '../io/git_make_web_uri.mjs';

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
			current = sub_ns;
		}
	}
	return current;
}

async function group_by_namespace(definitions, dirpath_repo, software=null) {
	const result = make_namespace(".");
	
	for(const filename in definitions) {
		const definition = definitions[filename];
		
		let namespace_name = definition.namespace, current = result;
		for(const block of definition.blocks) {
			block.filename = filename;
			switch(block.type) {
				case "namespace":
					namespace_name = block.namespace;
					current = find_namespace(result, namespace_name);
					current.def = block;
					break;
				
				case "class":
					namespace_name = block.namespace;
					current = find_namespace(result, namespace_name);
					current.type = "class";
					current.def = block;
					break;
				
				case "event":
					current.events.push(block);
					break;
				case "function":
					block.url = await git_make_web_uri(dirpath_repo, block.filename, software, block.line, block.line_last);
					current.functions.push(block);
					break;
				
				case "value":
					current.values.push(block);
					break;
				
				default:
					throw new Error(`Error: Unknown block type '${block.type}'.`);
			}
		}
	}
	
	return result;
}

export default async function(dirpath) {
	const filepaths_lua = await glob(path.join(dirpath, "**/*.lua"), {
		ignore: [ '.*/**' ]
	});
	
	const result = {};
	
	for(const filepath of filepaths_lua) {
		l.debug(`FILE ${filepath}`);
		
		const relative = path.relative(dirpath, filepath);
		
		const source = await fs.promises.readFile(filepath, "utf-8");
		
		result[relative] = parse_file(source);
	}
	const api = await group_by_namespace(result, dirpath);
	
	return api;
}