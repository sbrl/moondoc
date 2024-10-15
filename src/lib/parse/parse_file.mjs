"use strict";

import log from '../io/NamespacedLog.mjs'; const l = log("parse_file");

function parse_comment_line(line) {
	const match_content = line.match(/^\s*-{2,}\s(.*)$/);
	if(match_content === null) return null;
	const comment_text = match_content[1].trimEnd();
	const match_directive = comment_text.match(/^@([a-zA-Z0-9-_]+)(?:\s+(.*))?$/);
	
	if(match_directive === null)
		return { type: "text", text: comment_text };
	
	return {
		type: "directive",
		directive: match_directive[1],
		text: typeof match_directive[2] == "string" ? match_directive[2].trim() : ""
	};
}

function parse_function(line) {
	const match = line.match(/^\s*(?:(?:local|return)\s+)?function\s+([a-zA-Z_][a-zA-Z0-9:_.]+)\s*\(([a-zA-Z0-9_.,\s]*)\)/);
	if(match === null) {
		const match_anon = line.match(/^\s*(?:(?:local|return)\s*)?function\s*\(([a-zA-Z0-9_., ]*)\)/);
		if(match_anon == null) return null;
		return {
			type: "function",
			function: null,
			args: match_anon[1].split(/\s*,\s*/),
			namespace: null,
			instanced: false
		};
	}
	
	const result = {
		type: "function",
		function: match[1],
		args: match[2].split(/\s*,\s*/),
		namespace: null, // Default: whatever the current file-level namespace is
		instanced: false
	};
	
	const match_namespace = result.function.match(/^([^.]+)\.(.*)$/);
	if(match_namespace !== null) {
		result.namespace = match_namespace[1];
		result.function = match_namespace[2];
	}
	
	if (result.function.indexOf(`:`) > -1) {
		result.instanced = true;
		result.function = result.function.match(/:(.*)/)[1];
	}
	
	
	return result;
}

function find_block_comment(lines, i) {
	const match = lines[i].match(/^\s*-{3,}\s*(.*)$/);
	if(match === null) return null;
	const result = {
		type: "function",
		internal: false,
		description: match[1],
		directives: [],
		line: i,
		namespace: null
	};
	
	let mode = "description";
	for(let j = i+1; j < lines.length; j++) {
		const comment_line = parse_comment_line(lines[j]);
		// console.error(`DEBUG:comment line '${lines[j]}' comment_line`, comment_line);
		
		if(comment_line === null) {
			const function_def = parse_function(lines[j]);
			// console.error(`DEBUG:parse_block function_def`, function_def);
			result.line_last = j;
			if(function_def === null) break;
			if(function_def.function === null) {
				const directive = result.directives.find(item => item.directive == "name");
				result.name = typeof directive === "undefined" ? null : directive.text;
			}
			else
				result.name = function_def.function;
			result.instanced = function_def.instanced;
			result.args = function_def.args;
			if(function_def.namespace !== null)
				result.namespace = function_def.namespace;
			break;
		}
		
		switch(comment_line.type) {
			case "text":
				if(mode == "description") {
					result.description += `\n${comment_line.text}`;
					continue;
				}
				
				const last_directive = result.directives.at(-1);
				last_directive.text += `\n${comment_line.text}`;
				break;
			case "directive":
				const directive_new = {
					directive: comment_line.directive,
					text: comment_line.text
				};
				
				switch(directive_new.directive) {
					case "event":
						mode = "event";
						result.type = "event";
						result.event = comment_line.text;
						break;
					case "module":
						mode = "module-def";
						result.type = "module-def";
						result.namespace = directive_new.text;
						break;
					
					case "namespace":
						mode = "namespace";
						result.type = "namespace";
						result.namespace = directive_new.text;
						break;
					
					case "class":
						mode = "class";
						result.type = "class";
						result.namespace = directive_new.text;
						break;
					
					case "value":
						result.type = "value";
						break;
						
					case "internal":
						result.internal = true;
						// No break here on purpose, as we need to conditionally set mode VVVVV
					
					default:
						if(mode == "description")
							mode = "directives";
						break;
				}
				
				result.directives.push(directive_new);
				break;
		}
	}
	
	result.text = lines.slice(
		result.line,
		result.line_last + (result.type == "event" ? 0 : 1)
	);
	if(result.text.length === 0) {
		console.error(`DEBUG:parse_block ERROR NO_TEXT result`, result);
		console.error(`DEBUG:parse_block lines`, lines.length, lines);
		throw new Error(`Error: Failed to extract text for block`);
	}
	result.text = result.text.join("\n");
	
	return result;
}


/**
 * Postprocesses the directives in a given docblock 1 by 1.
 *
 * This function takes an array of directive objects and performs the following operations:
 * - Trims the text of each directive
 * - Processes the directives based on their type (param, return/returns, example)
 *
 * @param	{Object[]}	directives	An array of directive objects
 * @returns	{Object[]}	The modified array of directive objects
 */
function postprocess_directives(directives) {
	let counter_examples = 1;
	for(const item of directives) {
		const text_raw = item.text;
		item.text = item.text.trim();
		const parts = item.text.split(/\t+/);
		const lines = item.text.split(/\n+/);
		switch (item.directive) {
			case "param":
				item.name = parts[0];
				item.type = parts[1];
				item.description = parts[2];
				item.default_value = undefined;
				
				if(item.name.indexOf("=") > -1) {
					const param_subparts = item.name.split("=", 2);
					item.name = param_subparts[0];
					item.default_value = param_subparts[1];
				}
				
				break;
			case "return":
			case "returns":
				item.directive = "returns";
				item.type = parts[0];
				item.description = parts[1];
				break;
			
			case "example":
				if(text_raw.startsWith(`\n`)) {
					item.description = `Example ${counter_examples}`;
					item.example = item.text;
				}
				else {
					item.description = lines[0];
					item.example = lines.slice(1).join(`\n`);
				}
				counter_examples++;
				break;
		}
	}
	return directives;
}

function make_fn_full_name(namespace, name) {
	if(namespace === null || namespace.length === 0) return name;
	
	return `${namespace}.${name}`;
}

function parse_file(source) {
	const result = {
		type: "table",
		namespace: "",
		blocks: []
	};
	const lines = source.split(/\r?\n/);
	
	let i = -1, block_cur = {}, skip_until = -1;
	for(const line of lines) {
		i++;
		if(i < skip_until) continue;
		
		const comment = find_block_comment(lines, i);
		if(comment === null) continue;
		
		if(comment.directives.length === 0) {
			l.debug(`Ignoring block with no directives`, comment);
			continue;
		}
		
		if(comment.type !== "module-def")
			result.blocks.push(comment);
		
		// Post-process the docblock as a whole here
		postprocess_directives(comment.directives);
		comment.params = comment.directives.filter(item => item.directive == "param");
		comment.returns = comment.directives.find(item => item.directive == "returns");
		comment.examples = comment.directives.filter(item => item.directive == "example");
		
		
		
		switch(comment.type) {
			case "namespace":
			case "module-def":
				result.namespace = comment.namespace;
				break;
			case "class":
				result.type = "class";
				result.namespace = comment.namespace;
				break;
			
			case "function":
				comment.name_full = make_fn_full_name(result.namespace, comment.name);
				comment.namespace = result.namespace;
				// No break on purpose
			
			default:
				if(comment.namespace === null)
					comment.namespace = result.namespace;
				break;
		}
		
		skip_until = result.line_last + 1;
	}
	
	return result;
}

export default parse_file;