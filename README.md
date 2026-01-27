# @vaporproductions/vapors-cli

Vapor Productions CLI for generating Discord bot commands, events, and utilities.

## Install

Global install:

```bash
npm install -g @vaporproductions/vapors-cli
```

One-off usage:

```bash
npx @vaporproductions/vapors-cli help
```

## Quick start

Initialize once in your project:

```bash
vapors-cli init
```

Create a command:

```bash
vapors-cli generate --type command --name ping --category utility
```

Create an event:

```bash
vapors-cli generate --type event --name ready
```

Create a utility:

```bash
vapors-cli generate --type util --name formatDuration
```

## How it works

- Interactive by default: missing required flags will prompt you.
- Requires a `vapors.config.json` file created by `vapors-cli init`.

## Config file

`vapors.config.json`:

```json
{
  "version": 1,
  "projectRoot": ".",
  "structures": {
    "commands": "src/commands/categories",
    "events": "src/events",
    "utils": "src/utils"
  }
}
```

## Commands

```bash
vapors-cli help
vapors-cli init
vapors-cli generate --type command --name ping --category utility
vapors-cli generate --type event --name ready
vapors-cli generate --type util --name formatDuration
```
