#!/usr/bin/env node
// ld-prosa — UserPromptSubmit hook: short per-turn nudge. SessionStart
// injects the full ruleset once, but a single injection loses attention as
// a long conversation grows — this keeps the core rule visible every turn.
// No mode/intensity to track (unlike caveman/ponytail-style dials), so this
// just emits the same reminder unconditionally.

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'UserPromptSubmit',
    additionalContext:
      'ld-prosa active: default to precise/terse, but switch to building ' +
      'intuition with one concrete example before compressing into a table ' +
      'or acronym when a term is new or the question is why/for-what, not ' +
      'how. Flag unverified claims and decision reversals explicitly.'
  }
}));
