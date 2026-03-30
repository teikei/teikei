set shell := ["bash", "-euo", "pipefail", "-c"]

branch_prefix := "agents"
worktrees_dir := "../worktrees"

default:
  @just --list

# Create a new worktree on a branch named <prefix>/<type>/<slugified-name>.
[script]
worktree-new type name:
  branch_prefix="{{branch_prefix}}"
  worktrees_dir="{{worktrees_dir}}"
  slug="$$(printf '%s' "{{name}}" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$$//')"
  if [ -z "$$slug" ]; then
    echo "Name must contain at least one alphanumeric character after slugification." >&2
    exit 1
  fi
  branch="$$branch_prefix/{{type}}/$$slug"
  repo_root="$$(git rev-parse --show-toplevel)"
  mkdir -p "$$repo_root/{{worktrees_dir}}"
  worktree_root="$$(cd "$$repo_root/{{worktrees_dir}}" && pwd)"
  worktree_dir_name="$$(printf '%s' "$$branch" | tr '/' '-')"
  worktree_path="$$worktree_root/$$worktree_dir_name"
  if git show-ref --verify --quiet "refs/heads/$$branch" || git show-ref --verify --quiet "refs/remotes/origin/$$branch"; then
    echo "Branch already exists: $$branch" >&2
    exit 1
  fi
  git worktree add -b "$$branch" "$$worktree_path"
  if [ -x "$$worktree_path/scripts/link-env.sh" ]; then
    "$$worktree_path/scripts/link-env.sh"
  fi
  echo "Activated worktree: $$worktree_path"
  cd "$$worktree_path"
  exec "$${SHELL:-zsh}" -l

# Stage and commit all current changes.
[script]
commit-all message:
  git add --all
  git commit -m "{{message}}"

# Create a GitHub pull request for the current branch.
[script]
pr-create:
  gh pr create --fill

# Push the current branch to origin and set upstream tracking.
[script]
push:
  git push -u origin "$$(git branch --show-current)"

# Open an existing pull request in the browser. Pass a PR number/url or use the current branch PR.
[script]
pr-open pr='':
  if [ -n "{{pr}}" ]; then
    gh pr view "{{pr}}" --web
  else
    gh pr view --web
  fi
