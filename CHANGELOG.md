# Moondoc Changelog
This is the main changelog for moondoc.

-------
## Release template text

INTRO HERE

## Updating
Install or update with npm:

```bash
npm install --save-dev moondoc
```

VERSION CHANGELOG HERE

-------


## v1.3 (unreleased)
- Make moar code blocks syntax highlighted


## v1.2
- Add initial `@example` support with syntax highlighting by [`shiki`](https://shiki.style/)
- Display notice *This function takes no arguments* for functions that take no args
- CLI: Add `--name` argument to set the project name via CLI
- CSS: Don't show `hr.big-divider` when element before it is `.gone`

## v1.1
- Add `--branch` CLI argument to main `build` subcommand


## v1.0.1
- Declare `src/index.mjs` as binary `moondoc` for use in e.g. CI systems that check out a specific commit


## v1.0
- Initial release!