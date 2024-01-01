# moondoc

> Lua API documentation generator

Generates a single `.html` file in the style of e.g. [`documentation`](https://www.npmjs.com/package/documentation), but for Lua instead of Javascript.

This tool was originally written to assist with documenting [WorldEditAdditions](https://worldeditadditions.mooncarrot.space/) ([direct link to source code](https://github.com/sbrl/Minetest-WorldEditAdditions/)), as the output of [LuaDoc](https://github.com/keplerproject/luadoc/) didn't look the way I wanted and didn't handle the `dofile()`s we're forced to use across the codebase.

See also [LDoc](https://github.com/lunarmodules/ldoc).

Yes, I know this tool is written in Javascript and not Lua, but Lua doesn't come with batteries included so writing a Lua documentation generator in Lua would have been a *painful* process....

## Documentation blocks
Moondoc functions on documentation blocks in a similar format to that of JSDoc. Here's an example block:

```lua
--- Subtracts the specified vectors or numbers together.
-- Returns the result as a new vector.
-- If 1 of the inputs is a number and the other a vector, then the number will
-- be subtracted to each of the components of the vector.
-- @param	a	Vector3|number	The first item to subtract.
-- @param	a	Vector3|number	The second item to subtract.
-- @returns	Vector3				The result as a new Vector3 object.
```

Moondoc documentation blocks **always start with a triple dash**, and end on the next non-comment line. Each block is made up of 3 parts:

1. **First line:** The short summary of what the thing does
2. **Description:** The next lines are considered the extended description of the thing
3. **At rules:** Lastly, lines beginning with an `@` are at rules. For example, `@param` describes an argument of a function. At rules may have text flowing onto multiple lines.

Documentation blocks should be used in the following places:

**Before functions:**

```lua
--- Determines if this vector is contained within the region defined by the given vectors.
-- @param	a		Vector3		The target vector to check.
-- @param	pos1	Vector3		pos1 of the defined region.
-- @param	pos2	Vector3		pos2 of the defined region.
-- @return	boolean	Whether the given target is contained within the defined worldedit region.
function Vector3.is_contained(target, pos1, pos2)
	-- Function code here
end
```

> [!IMPORTANT]
> Documentation blocks defining a function **must be directly before a function**.

**At the top of each file with [`@namespace`](#namespace) or [`@class`](#class):**

```lua
--- A 3-dimensional vector.
-- @class	worldeditadditions_core.Vector3
local Vector3 = {}

-- .....
```

```lua
--- Functions for parsing things.
-- @namespace worldeditadditions_core.parse
worldeditadditions_core.parse = {
	-- .....
}

-- ........
```


**To document [events](#events)*:**

```lua
--- A new position has been set in a player's list at a specific position.
-- @event	set
-- @format	{ player_name: string, i: number, pos: Vector3 }
-- @example
-- {
-- 	player_name = "some_player_name",
-- 	i = 3,
-- 	pos = <Vector3> { x = 456, y = 64, z = 9045 }
-- }
```

* See [EventEmitter.lua](https://github.com/sbrl/Minetest-WorldEditAdditions/blob/main/worldeditadditions_core/utils/EventEmitter.lua) [licence: MPL-2.0] for an example `EventEmitter` / eventing system implementation

### At rules
The following at rules exist:

#### `@param`
Describes an argument to a function. Values are whitespace separated, in the following format:

```lua
-- @param <variable_name>	<data_type>	<description>
```

- **`<variable_name>`:** The name of the argument. This must match the function definition.
- **`<data_type>`:** The data type of the argument. This can be a built-in type (e.g. `number`, `string`, etc), or some custom class name (e.g. `Vector3`).
- **`<description>`:** Describe the purpose of the argument here! Don't forget to include any non-obvious things about the behaviour and format of the argument too. Descriptions can flow over multiple lines to really describe something in detail.

### `@return` / `@returns`
Describes the return value(s) of a function. Values are whitespace separated, in the following format:

```lua
<data_type>	<description>
```

- **`<data_type>`:** The data type of the item being returned. If multiple items are returned, separate them with commas.
- **`<description>`:** A description of the return value.

## System Requirements
- Node.js

## Getting started



TODO Fill this out.


TODO DO NOT FORGET TO RUN ESBUILD **BEFORE** MAKING A RELEASE