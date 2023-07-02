"use strict";

function parse_comment_line(line) {
	const match_content = line.match(/^\s*-{2,}\s*(.*)$/);
	if(match_content === null) return null;
	const comment_text = match_content[1].trim();
	const match_directive = comment_text.match(/^@([a-zA-Z0-9-_]+)(?:\s+(.*))?$/);
	
	if(match_directive === null)
		return { type: "text", text: comment_text.trim() };
	
	return {
		type: "directive",
		directive: match_directive[1],
		text: typeof match_directive[2] == "string" ? match_directive[2].trim() : ""
	};
}

function parse_function(line) {
	const match = line.match(/^\s*(?:(?:local|return)\s+)?function\s+([a-zA-Z_][a-zA-Z0-9:_.]+)\s*\(([a-zA-Z0-9_.,\s]*)\)/);
	console.error(`DEBUG:parse_function line '${line}' match`, match);
	if(match === null) {
		const match_anon = line.match(/^\s*(?:(?:local|return)\s*)?function\s*\(([a-zA-Z0-9_., ]*)\)/);
		console.error(`DEBUG:parse_function line '${line}' match_anon`, match_anon);
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
	
	const match_namespace = result.function.match(/^([^.]+)\..*$/);
	if(match_namespace !== null)
		result.namespace = match_namespace[1];
	
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
	
	return result;
}

function postprocess_directives(directives) {
	for(const item of directives) {
		item.text = item.text.trim();
		const parts = item.text.split(/\t+/);
		switch (item.directive) {
			case "param":
				item.name = parts[0];
				item.type = parts[1];
				item.description = parts[2];
				break;
			case "return":
			case "returns":
				item.type = parts[0];
				item.description = parts[1];
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
		postprocess_directives(comment.directives);
		result.blocks.push(comment);
		
		switch(comment.type) {
			case "namespace":
				result.namespace = comment.namespace;
				break;
			case "class":
				result.type = "class";
				result.namespace = comment.namespace;
				break;
			
			case "function":
				result.name_full = make_fn_full_name(result.namespace, comment.name);
				console.error(`DEBUG:file/line >> comment namespace`, result.namespace, `comment`, comment, `name_full`, result.name_full);
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