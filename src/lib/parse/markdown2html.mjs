"use strict";

import { marked } from "marked";
import sanitize from "sanitize-html";

export default function markdown2html(source) {
	return sanitize(marked(source, {
		mangle: false, // Please don't insert email addresses into your codebase, because mangling them is deprecated in marked, the markdown renderer we use
		headerIds: false, // The suggested package doesn't work with marked 6 :-/
	}));
}