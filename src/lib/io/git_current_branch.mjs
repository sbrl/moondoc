"use strict";

import path from 'path';
import fs from 'fs';

import log from '../io/NamespacedLog.mjs'; const l = log("git_current_branch");


export default async function(dirpath_repo) {
	const filepath_branch = path.join(dirpath_repo, ".git", "HEAD");
	let content;
	try {
		content = await fs.promises.readFile(filepath_branch, "utf-8");
	}
	catch(error) {
		if(error.code == `ENOENT`) {
			l.warn(`Error: The file '${filepath_branch}' does not exist, is this really a git repository? Alternatively, you may not have permission to read this file.`);
			return null;
		}
		throw error;
	}
	const matches = content.match(/.*\/(\S+)/);
	if(!matches) {
		l.warn(`Error: The HEAD file in '${filepath_branch}' is not in a recognised format.`);
		return null;
	}
	return matches[1];
}