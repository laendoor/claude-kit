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
      'ld-prosa active: terse means cutting data and ceremony, never the ' +
      'reasoning — a recommendation or a rule always carries its why, and ' +
      'compression removes ideas, never grammar (no telegraphic fragments). ' +
      'Explaining a mechanism? Build it from the problem with one concrete ' +
      'instance first; the trigger is the reader re-entering the context, ' +
      'not the term being new, so familiarity does not lower the bar. ' +
      'Reasoning goes in whole sentences, topology in a diagram. Close on ' +
      'the consequence. Flag unverified claims and decision reversals ' +
      'explicitly. Inside a source file none of this applies: comments are ' +
      'Annotation — one line, two if the consequence needs it, more only ' +
      'for docstrings and headers.'
  }
}));
