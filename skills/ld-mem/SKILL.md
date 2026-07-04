---
name: ld-mem
description: Pre-`/clear` handoff for the current session — freezes the load-bearing working state to a per-session file under ~/.claude/ld-mem/, then emits a ready-to-paste prompt to re-hydrate a fresh context after you run `/clear`. Cheaper and cleaner than `/compact` (no summarization cost, no post-compact drift) — a fresh context that reads the handoff beats a compacted one. Does NOT run `/clear` itself. Run it before you `/clear` a long working session. Global, project-agnostic.
argument-hint: [optional focus note]
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(git:*), Bash(basename:*), Bash(dirname:*), Bash(ls:*), Bash(find:*), Bash(cat:*), Bash(mkdir:*), Bash(date:*)
---

Freeze this session's working state to a handoff file, then hand you a prompt to paste **after** you `/clear`. Unlike `/compact` — which summarizes the *conversation* (costs a model call, leaves a lossy summary that occupies tokens and drags session noise into the next turns) — `/clear` drops 100% of context. So a fresh context that reads a tight handoff resumes more reliably than a compacted one keeps going.

**The trade-off this skill lives with:** with `/clear` there is **no safety net**. `/compact` at least leaves a summary that might rescue what you forgot to write down; `/clear` does not. Whatever this skill fails to flush to the handoff file is gone. The anti-loss sweep (step 4) is therefore the *only* chance, not the last one — treat it that way.

**It does not run `/clear`** — a skill can't, and `/clear` isn't hookable (it's your command, like `/compact`). This prepares the file and gives you the prompt.

**Argument:** `$1` (optional) = a short focus note to fold into the handoff and the re-hydrate prompt (e.g. "keep the auth refactor reasoning"). If absent, the skill decides what matters.

## Why this works across `/clear`

`/clear` wipes context but does **not** end the session — the session-id is stable across it. The handoff filename is keyed on that id, and the re-hydrate prompt carries the **literal path**, so after `/clear` (same session) the path still resolves. Even if you instead start a brand-new session, the pasted path still points at the right file.

claude-mem already reinjects recent decisions/discoveries at every fresh start (its SessionStart hook). This handoff covers the half claude-mem doesn't: *where you're standing right now and the next command*. They complement; don't duplicate claude-mem into the handoff.

## Conventions (locked in)

- **One file per session, overwritten.** Each run overwrites the same path — you want the *live* state, not a history. Timestamp lives inside the file as metadata, never in the name.
- **No GC.** Files are tiny prose; let `~/.claude/ld-mem/` grow. Prune by hand if a disk tool ever flags it.
- **Project-agnostic.** This is a global skill — it must NOT assume any project's scaffolding (no `plan.md`/`epic.md`/tickets contract). It *detects* canonical files if present and points at them; it never requires them.
- **Don't invent progress.** Only write what actually happened this session. Implemented-but-uncommitted work is recorded as exactly that — unstaged.
- **Writes only the handoff file.** Never edits source, never commits, stages, or pushes.

## Idioma

- The handoff `.md` is your own working context (never cloud-bound): prose in **español rioplatense técnico**, identifiers / paths / code literal.
- The re-hydrate prompt (step 6): match the session's predominant language.

## Steps

### 1. Detect the session key

- **Project name:** `basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)"`.
- **Branch slug:** `git rev-parse --abbrev-ref HEAD 2>/dev/null` → replace `/` with `-` (e.g. `feat/GRTTL4C-274` → `feat-GRTTL4C-274`). No git → `no-git`.
- **Session-short:** the 8-char prefix of the session UUID. Derive it from your scratchpad path — it's the basename of the directory that *contains* your scratchpad dir (`.../<UUID>/scratchpad` → take `<UUID>`, first 8 chars). If you can't resolve it, fall back to a short timestamp (`date +%H%M%S`) and say so.
- **Session name:** the user-set session name, which `/clear` wipes. Look it up by full UUID in the live session index — its only home, keyed on `sessionId`:
  ```bash
  python3 -c "import json,glob;print(next((json.load(open(f)).get('name','') for f in glob.glob('$HOME/.claude/sessions/*.json') if json.load(open(f)).get('sessionId')=='<FULL_UUID>'),''))"
  ```
  Empty result = unnamed session → skip the name everywhere below.
- **Target path:** `~/.claude/ld-mem/<project>/<branch-slug>__<session-short>.md`. `mkdir -p` the project dir.

### 2. Detect canonical files (don't assume)

Glob the repo for working-state files worth pointing at — `plan.md`, `epic.md`, `TODO*`, `.claude/tickets/*/`, an open design doc. If found, you'll list them as pointers in the handoff (don't copy their contents — point). If none, skip; the handoff carries the full state itself.

### 3. Build the handoff

Reconstruct, from this session, what a fresh context needs to resume. Write the file with this shape:

```markdown
# Handoff — <project> / <branch> (sesión <session-short>)
_actualizado: <date '+%Y-%m-%d %H:%M'>_
_sesión: <session name — omit this line if unnamed>_

## Objetivo
<qué se está haciendo, 1–2 líneas>

## Estado actual
<dónde quedó; qué está hecho, qué a medias>

## Próximo paso
<la acción inmediata + el comando concreto si lo hay>

## Decisiones (load-bearing)
- <decisión> — <por qué> (approaches descartados y la razón)

## Gotchas / abierto
- <trampa encontrada, pregunta sin resolver>

## Archivos
- tocados/unstaged: <git status --short>
- punteros: <canonical files del paso 2, con full path>

## Foco ($1)
<el focus note, si lo pasaron>
```

Drop empty sections. One line per fact, ≤20 words. This file IS the context — be complete over terse here.

### 4. Anti-loss sweep (the only chance)

Re-scan the session for anything load-bearing not yet in the file: a decision and its *why*, a rejected approach, a gotcha, an open question, an in-flight edit. Fold it in. There is no summary coming behind this — if it's not in the file, it's lost.

### 5. Write the file

Overwrite the target path with the composed handoff. Confirm the write.

### 6. Emit the re-hydrate prompt

The re-hydrate prompt is a **read-and-stage** order, never a **go** order. The handoff's "Próximo paso" is *information about where work stopped* — not authorization to resume it. A fresh context that reads "Seguí desde Próximo paso" tends to start editing immediately; that's the failure mode this wording must prevent. The plan→align→execute contract still holds across `/clear`: after reading, the assistant reports it's ready and **waits for an explicit go** before touching anything.

Print:
- A one-line recap: which file was written, which sections it has.
- Then the ready-to-paste block, on its own, e.g.:
  ```
  Retomá la sesión: leé ~/.claude/ld-mem/<project>/<branch>__<sid>.md — tiene objetivo, estado, próximo paso y decisiones. SOLO leé y preparate: NO ejecutes ni edites nada todavía. Cuando termines de leer, resumí dónde quedó y cuál sería el próximo paso, y esperá mi OK explícito antes de tocar nada.
  ```
  If the session was named, append to that block: `(renombrá la sesión a "<name>" — /clear lo borró)`.
- A reminder: **"Ahora corré `/clear`, después pegá el prompt de arriba."**

**Then stop.** You run `/clear` yourself; the skill never does.

## What this skill explicitly does NOT do

- Doesn't run `/clear` — emits the prompt for you.
- Doesn't commit, stage, or push — flags unstaged work, leaves it untouched.
- Doesn't edit source — writes only the handoff file under `~/.claude/ld-mem/`.
- Doesn't duplicate claude-mem — covers in-flight working state, not decision history.
