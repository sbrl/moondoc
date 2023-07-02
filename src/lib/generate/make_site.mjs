"use strict";

import fs from 'fs';

import { NightInkFile } from "nightink";

function make_html_function(def) {
	return NightInkFile("../../templates/function.html", def);
}

export default async function make_site(api, dirpath_out) {
	
}