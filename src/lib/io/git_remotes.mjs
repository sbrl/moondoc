"use strict";

import { promisify } from 'util';
import git_remotes from 'git-remotes';

import log from '../io/NamespacedLog.mjs'; const l = log("git_remotes");

const GitRemotes = promisify(git_remotes);

export default async function(dirpath) {
	try {
		return await GitRemotes(dirpath);
	}
	catch(error) {
		l.warn(`Error while finding git remotes for repository '${dirpath}':`, error);
		return [];
	}
}