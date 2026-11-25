# Auto-approval criteria

A PR is safe to auto-approve when all of the following are true:

- It was opened by the Remediation Agent's production bot, `sonarqube-agent[bot]`.
- Gitar's own whole-PR risk assessment is **Low risk**. If no risk assessment is available, this
  criterion is not met.
- The PR does not modify any file under `.gitar/`, `.github/`, `.github-public/`, `.claude/`,
  `.agents/`, `.cursor/`, `.vscode/`, `.yarn/`, `config/`, `private/config/`, `tools/`,
  `makefiles/` or `private/sq-cloud-assets/`, nor any `AGENTS.md`, `CLAUDE*.md`, `package.json`,
  `project.json`, `Makefile`, `*.mk` or `yarn.lock` file anywhere in the repo, nor the root files
  `.yarnrc.yml`, `.npmrc`, `mise.toml`, `renovate.json`, `nx.json` or `wss-unified-agent.config`.
  PRs touching these paths are never auto-approved, regardless of author or risk rating.

Do not auto-approve a PR from any other author, or a `sonarqube-agent[bot]` PR at any other risk
rating — leave those to a human/org default.
