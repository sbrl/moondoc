"use strict";

export default function(cli) {
	cli.subcommand("build", "Builds a documentation page from the Lua source in a given directory.")
		.argument("input", "The input directory to draw from [default: current working directory].", process.cwd(), "string")
		.argument("output", "The output directory to write to [default: stdout as a single html file]", null, "string")
		.argument("software", "The software of the remote the code is hosted on. Used when generating links to source code. Defaults to automatically detecting this from the domain name of the first git remote. Currently supported values: github.com, gitlab.com [also supports custom gitlab instances], sr.ht [also supports custom SourceHut instances], gitea [the default if it can't be automatically detected].", null, "string");
}