"use strict";

function find_namespace(line) {
	const match = line.match(/^\s*-{2,}\s*@namespace\s+(.*)$/);
	if(match !== null)
		return match[1];
	return null;
}

function parse_comment_line(line) {
	const match_content = line.match(/^\s*-{2,}\s*(.*)$/);
	if(match_content === null) return null;
	const comment_text = match_content[1];
	const match_directive = comment_text.match(/^@([a-zA-Z0-9-_]+)\s+(.*)^/);
	if(match_directive === null)
		return { type: "text", text: comment_text.trim() };
	
	return {
		type: "directive",
		directive: match_directive[1],
		text: match_directive[2].trim()
	};
}

function parse_function(line) {
	const match = line.match(/^\s*function\s+([a-zA-Z_][a-zA-Z0-9_.]+)\s*\(([a-zA-Z0-9_., ]+)\)/);
	if(match === null) return null;
	return {
		type: "function",
		function: match[1],
		args: match[2].split(/\s*,\s*/)
	};
}

function find_block_comment(lines, i) {
	const match = lines[i].match(/^\s*-{3,}\s*(.*)$/);
	if(match === null) return null;
	const result = {
		description: match[1],
		directives: []
	};
	
	let mode = "description";
	for(let j = i; j < lines.length; j++) {
		const comment_line = parse_comment_line(line);
		if(comment_line === null) {
			const function_def = parse_function(lines[j]);
			if(function_def === null) break;
			result.function = {
				function: function_def.function,
				args: function_def.args
			};
			result.last_line_parsed = j;
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
				result.directives.push({
					directive: comment_line.directive,
					text: comment_line.text
				});
				if(result.directives.at(-1).directive == "event")
					mode = "event";
				else if(mode == "description")
					mode = "directives";
				break;
		}
	}
	
	return result;
}

function parse_file(source) {
	const result = {
		namespace: null,
		blocks: []
	};
	const lines = source.split(/\r?\n/);
	
	let i = -1, block_cur = {}, skip_until = -1;
	for(const line of lines) {
		i++;
		if(i < skip_until) continue;

		const namespace = find_namespace(line);
		if(namespace) {
			result.namespace = namespace;
			continue;
		}
		
		const comment = find_block_comment(lines, i);
		if(comment === null) continue;
		
		result.blocks.push(comment);
		skip_until = result.last_line_parsed + 1;
	}
	
	return result;
}

export default parse_file;