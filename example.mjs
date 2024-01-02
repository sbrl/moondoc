#!/usr/bin/env node
"use strict";

/*
 * This script demos how to call moondoc via Javascript.
 */

import fs from 'fs';

// You would use import moondoc from 'moondoc/src/lib.mjs';
import moondoc from './src/lib.mjs';

(async () => {
	"use strict";
	
	const content = await moondoc(
		"/home/sbrl/.minetest/worlds/Mod-Sandbox/worldmods/WorldEditAdditions"
		// Optionally, an options object here - but you should not normally need this for anything other than hacking on the code
	);
	
	await fs.promises.writeFile("/tmp/x/worldeditadditions.html", content);
})();