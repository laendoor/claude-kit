import { join } from "path";

export const LdProsaPlugin = async () => {
	const pluginDir = import.meta.dirname ?? ".";
	const skillPath = join(pluginDir, "skills", "ld-prosa", "SKILL.md");

	let skillRules = "";
	try {
		const f = Bun.file(skillPath);
		if (await f.exists()) {
			const raw = await f.text();
			skillRules = raw.replace(/^---[\s\S]*?---\s*/, "");
		}
	} catch (_) {}

	const reminder =
		"ld-prosa active: default to precise/terse, but switch to building " +
		"intuition with one concrete example before compressing into a table " +
		"or acronym when a term is new or the question is why/for-what, not " +
		"how. Flag unverified claims and decision reversals explicitly.";

	return {
		"session.created": async (_input, _output) => {
			if (skillRules) {
				// ponytail: single output write, no progress tracking
			}
		},
		"tui.prompt.append": async (_input, output) => {
			// ponytail: appends reminder text, no semantic merge
			if (output?.args?.text != null) {
				output.args.text = `${reminder}\n\n${output.args.text}`;
			}
		},
	};
};
