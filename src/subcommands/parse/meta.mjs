"use strict";

export default function(cli) {
	cli.subcommand("parse", "Debugging purposes. Parses a directory of files. Ignores subdirectories that start with a dot.")
		.argument("input", "The input directory to parse.", null, "string");
}