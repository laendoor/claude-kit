# claude-kit

Personal, versioned Claude Code + OpenCode config (skills and plugins).

## Layout

```txt
skills/<name>/                                     ← on-demand skill (Claude Code)
plugins/<name>/                                    ← always-on plugin (Claude Code + OpenCode)
.claude-plugin/marketplace.json                    ← plugin marketplace manifest
```

Skills comparten single source of truth entre ambos — ver instalación abajo.

---

## OpenCode

### ld-prosa — skill + plugin

El skill es el mismo que usa Claude Code:

```bash
ln -s ~/dev/claude-kit/plugins/ld-prosa/skills/ld-prosa ~/.config/opencode/skills/ld-prosa
```

Plugin (hooks):

```bash
ln -s ~/dev/claude-kit/plugins/ld-prosa/opencode-plugin.js ~/.config/opencode/plugins/ld-prosa.js
```

**Always-on rules** (sin invocar skill cada turno): copiá las reglas fijas
de `plugins/ld-prosa/skills/ld-prosa/SKILL.md` (sección *Fixed rules*) a
tu `opencode.json` → `rules` o a `AGENTS.md`.

---

## Claude Code

Skills that don't need to be always-on are activated with a symlink from the
global skills dir:

```bash
ln -s ~/dev/claude-kit/skills/<name> ~/.claude/skills/<name>
```

Symlinks resolve only on a fresh Claude Code session (skills load at startup).

Plugins (things that need to run unprompted every turn, via hooks) are
installed instead of symlinked:

```txt
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
  Always active via `SessionStart` + `UserPromptSubmit` hooks (Claude Code)
  or `opencode-plugin.js` + skill (OpenCode).

## External skills worth installing

Not vendored here (third-party, own repos). Install separately:

- **humanizer** — strips AI-writing tells from text.
  <https://github.com/blader/humanizer>
  ```bash
  git clone https://github.com/blader/humanizer.git ~/.claude/skills/humanizer
  ```
