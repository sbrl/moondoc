"use strict";

export default function(cli) {
	cli.subcommand("parse-file", "Debugging purposes. Parses a single file.")
		.argument("input", "The input file to parse.", null, "string");
}