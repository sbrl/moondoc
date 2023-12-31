"use strict";

import Fuse from 'fuse.js';

function make_index(els_nav) {
	const index = [];
	for (const el of els_nav) {
		const id = el.href.replace(/.*#/, "");
		
		let el_docs = document.getElementById(id);
		if(el_docs !== null)
			el_docs = el_docs.closest("section");
		
		index.push({
			id: id,
			nav_content: (el.closest("li") ?? el).innerText,
			text: (el_docs ?? el).innerText
		});
	}
	return index;
}

function apply_results(els_nav, index, results) {
	
}

export default function() {
	const el_search = document.querySelector("#__moondocs__search");
	const els_nav = [...document.querySelectorAll("nav a")];
	
	
	const index = make_index(els_nav);
	const fuse = new Fuse(index, [
		"id",
		"nav_content",
		"text"
	]);
	
	console.log(`el_search`, el_search, `els_nav`, els_nav, `index`, index);
	
	el_search.addEventListener("keyup", (event) => {
		const query = event.target.value;
		const results = fuse.search(query);
		console.info(`[ui_search] SEARCH | query`, query, `results`, results);
		apply_results(els_nav, index, results);
	});
}