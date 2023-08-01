"use strict";

export default function(cli) {
	cli.subcommand("parse-file", "[DEBUGGING] Parses a single file.")
		.argument("input", "The input file to parse.", null, "string");
}