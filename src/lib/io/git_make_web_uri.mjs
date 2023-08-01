"use strict";

import git_url_parse from 'git-url-parse';

import git_remotes from './git_remotes.mjs';
import git_current_branch from './git_current_branch.mjs';

async function make_web_url(dirpath_repo, filepath, software=null) {
	const remotes = await git_remotes(dirpath_repo);
	if(remotes.length == 0) return null;
	const remote_url = remotes[0].url;
	
	const branch = await git_current_branch(dirpath_repo);
	if(branch == null) return null;
	
	const parts = git_url_parse(remote_url);
	const source = software == null ? parts.source : software;
	switch(source) {
		case "github.com":
			return [source, `https://github.com/${parts.owner}/${parts.name}/blob/${branch}/${filepath}`];
		case "gitlab.com":
			return [source, `https://${parts.host}/${parts.owner}/${parts.name}/blob/${branch}/${filepath}`];
		case "sr.ht":
			return [source, `https://${parts.host}/${parts.owner}/${parts.name}/tree/${branch}/item/src/${filepath}`];
		default: // Assume Gitea
			return [source, `https://${parts.host}/${parts.owner}/${parts.name}/src/branch/${branch}/${filepath}`];
	}
}

/**
 * Makes a web URL from a path to a git repo on disk and the relative filepath inside that repo.
 *
 * @param	{string}	dirpath_repo	The path to the git repository on disk.
 * @param	{string}	filepath		The relative filepath to the target file inside the git repo. Do no include './'.
 * @param	{string}	software		If specified, overrides the automatic git software detection algorithm and forces URLs for specific software to be generated. Current possible values: github.com, gitlab.com, sr.ht, gitea. The algorithm defaults to Gitea if it can't detect a URL. Mainly useful for SourceHut/GitLab/etc instances. More can be added easily on request - just open a PR/issue.
 * @param	{number}	line_start		If specified, links to this line in the specified filepath.
 * @param	{number}	line_end		If specified, expands the line highlighted to be a range starting at line_start and ending at line_end, inclusive.
 *
 * @return	{string}                The generated web URL.
 */
export default async function(dirpath_repo, filepath, software=null, line_start=null, line_end=null) {
	let [source, web_url] = await make_web_url(dirpath_repo, filepath, software);
	if(line_start !== null)
		web_url += `#L${line_start}`;
	if(line_end !== null) {
		// Yay, more different formats...!
		if(["sr.ht"].includes(source))
			web_url += `-${line_end}`;
		else
			web_url += `-L${line_end}`;
	}
	
		return web_url;
}