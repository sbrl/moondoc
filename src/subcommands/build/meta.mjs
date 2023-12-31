"use strict";

export default function(cli) {
	cli.subcommand("build", "Builds a documentation page from the Lua source in a given directory.")
		.argument("input", "The input directory to draw from [default: current working directory].", process.cwd(), "string")
		.argument("output", "The output directory to write to [default: stdout as a single html file]", null, "string")
		.argument("software", "The software of the remote the code is hosted on. Used when generating links to source code. Defaults to automatically detecting this from the domain name of the first git remote. Currently supported values: github.com, gitlab.com [also supports custom gitlab instances], sr.ht [also supports custom SourceHut instances], gitea [the default if it can't be automatically detected].", null, "string")
		.argument("debug-sourcemaps", "DEBUG OPTION. Include a source map when writing inline JS. Clone the git repo of moondoc to use this option.", false, "boolean")
		.argument("debug-nominify", "DEBUG OPTION. Don't minify the HTML and CSS output. Greatly increases the size of the output .html file.", false, "boolean");
}