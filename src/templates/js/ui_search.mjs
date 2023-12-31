"use strict";

import microfuzz from '@nozbe/microfuzz';

const createFuzzySearch = microfuzz.default;

function get_section(id) {
	let el_docs = document.getElementById(id);
	if (el_docs == null) return null;
	
	el_docs = el_docs.closest("section");
	return el_docs;
}

function make_index(els_nav) {
	const index = [];
	for (const el of els_nav) {
		const id = el.href.replace(/.*#/, "");
		
		
		index.push({
			id: id,
			nav_content: (el.closest("li") ?? el).innerText.toLocaleLowerCase(),
			text: (get_section(id) ?? el).innerText.toLocaleLowerCase()
		});
	}
	return index;
}

function visibility_check(el) {
	// If any child nodes are supposed to be visible, we should be too
	if(el.querySelector(".search-result") !== null) {
		el.classList.remove("gone", "no-search-result");
	}
}

function show_all() {
	[...document.querySelectorAll(".search-result, .no-search-result, .gone")].map(el => el.classList.remove("search-result", "no-search-result", "gone"))
}

function apply_results(els_nav, index, results) {
	for(const el_nav of els_nav) {
		const id_this = el_nav.href.replace(/.*#/, "");
		const el_section = get_section(id_this);
		const el_nav_li = el_nav.closest("li");
		
		if(el_section == null)
			console.error(`NULL SECTION id_this`, id_this, `el_nav`, el_nav);
		
		if(results.find(el => el.item.id == id_this)) {
			// It matches!
			el_nav_li.classList.add("search-result");
			el_nav_li.classList.remove("gone", "no-search-result");
			if(el_section !== null) {
				el_section.classList.add("search-result");
				el_section.classList.remove("gone", "no-search-result");
			}
		}
		else {
			// No match :-(
			el_nav_li.classList.add("gone", "no-search-result");
			if(el_section !== null)
				el_section.classList.add("gone", "no-search-result");
		}
	}
	
	// Ensure all nodes that should be visible are
	for (const el_nav of els_nav) {
		const id_this = el_nav.href.replace(/.*#/, "");
		const el_section = get_section(id_this);
		
		visibility_check(el_nav);
		visibility_check(el_section);
	}
}

export default function() {
	const el_search = document.querySelector("#__moondocs__search");
	const els_nav = [...document.querySelectorAll("nav a")];
	
	const index = make_index(els_nav);
	const engine = createFuzzySearch(index, { // options
		getText: (item) => {
			return Object.values(item);
		}
	});
	
	console.log(`el_search`, el_search, `els_nav`, els_nav, `index`, index);
	
	el_search.addEventListener("keyup", (event) => {
		const query = event.target.value;
		if(query.length > 0) {
			const results = engine(query);
			const results_good = results.filter(result => result.score <= 5);
			console.info(`[ui_search] SEARCH`, query, `| results score <= 5`, results_good);
			apply_results(els_nav, index, results_good);
		}
		else {
			show_all();
		}
	});
}