# claude-kit

Personal, versioned Claude Code config (skills and friends). The real files
live here; `~/.claude/` points at them via symlinks, so they stay organized in
git while being active.

## Layout

```
skills/<name>/                   ← on-demand skill, invoked manually via the Skill tool
plugins/<name>/                  ← always-on plugin (hooks + its own skill), installed via /plugin
.claude-plugin/marketplace.json  ← lists the plugins this repo offers
```

Skills that don't need to be always-on are activated with a symlink from the
global skills dir:

```bash
ln -s ~/dev/claude-kit/skills/<name> ~/.claude/skills/<name>
```

Symlinks resolve only on a fresh Claude Code session (skills load at startup).

Plugins (things that need to run unprompted every turn, via hooks) are
installed instead of symlinked:

```
/plugin marketplace add laendoor/claude-kit
/plugin install ld-prosa@claude-kit
```

## Skills

- `ld-mem` — pre-`/clear` session handoff: freezes working state to a per-session
  file under `~/.claude/ld-mem/`, emits a re-hydration prompt for a fresh context.

## Plugins

- `ld-prosa` — posture-switching communication style. Default register is
  terse/precise; switches to building intuition with a concrete example
  first when a term is new or the question is why/for-what rather than how.
  Always active via `SessionStart` + `UserPromptSubmit` hooks, not invoked
  per task.

## External skills worth installing

Not vendored here (third-party, own repos). Install separately:

- **humanizer** — strips AI-writing tells from text.
  <https://github.com/blader/humanizer>
  ```bash
  git clone https://github.com/blader/humanizer.git ~/.claude/skills/humanizer
  ```
