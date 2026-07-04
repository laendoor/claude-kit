#!/usr/bin/env node
// ld-prosa — SessionStart hook: inject the ruleset from SKILL.md so it's
// live from turn one, instead of waiting to be invoked as an on-demand skill.
// SKILL.md is the single source of truth — this just reads it at runtime so
// edits to the skill propagate without touching this script.

const fs = require('fs');
const path = require('path');

const skillPath = path.join(__dirname, '..', 'skills', 'ld-prosa', 'SKILL.md');

let body;
try {
  const raw = fs.readFileSync(skillPath, 'utf8');
  body = raw.replace(/^---[\s\S]*?---\s*/, ''); // strip YAML frontmatter
} catch (e) {
  process.stdout.write('OK');
  process.exit(0);
}

process.stdout.write('LD-PROSA ACTIVE\n\n' + body);
