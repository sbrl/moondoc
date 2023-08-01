"use strict";

export default function(cli) {
	cli.subcommand("build", "Builds a documentation page from the Lua source in a given directory.")
		.argument("input", "The input directory to draw from [default: current working directory].", process.cwd(), "string")
		.argument("output", "The output directory to write to [default: stdout as a single html file]", null, "string");
}