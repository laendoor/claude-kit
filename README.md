# claude-kit

Personal, versioned Claude Code config (skills and friends). The real files
live here; `~/.claude/` points at them via symlinks, so they stay organized in
git while being active.

## Layout

```
skills/<name>/   ← real, versioned skill
```

Each skill is activated with a symlink from the global skills dir:

```bash
ln -s ~/dev/claude-kit/skills/<name> ~/.claude/skills/<name>
```

Symlinks resolve only on a fresh Claude Code session (skills load at startup).

## Skills

- `ld-mem` — pre-`/clear` session handoff: freezes working state to a per-session
  file under `~/.claude/ld-mem/`, emits a re-hydration prompt for a fresh context.

## External skills worth installing

Not vendored here (third-party, own repos). Install separately:

- **humanizer** — strips AI-writing tells from text.
  <https://github.com/blader/humanizer>
  ```bash
  git clone https://github.com/blader/humanizer.git ~/.claude/skills/humanizer
  ```
