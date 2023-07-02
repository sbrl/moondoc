"use strict";

/**
 * Hashes a string to a numerical value.
 * NOT CRYPTOGRAPHICALLY SECURE!
 * @param	{string}	str		The string to hash.
 * @return	{number}	The resulting hashed value as a number.
 */
export default function(str) {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = ((hash << 5) - hash) + str.charCodeAt(i);
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
}
