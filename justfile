set shell := ["bash", "-euo", "pipefail", "-c"]

branch_prefix := "agents"
worktrees_dir := "../worktrees"

default:
    @just --list

# Create a new worktree on a branch named <prefix>/<type>/<slugified-name>.
worktree-new type name:
    @just _create-worktree {{ quote(type) }} {{ quote(name) }} shell

# Create a new agent worktree and print the path without opening a shell.
agent-start type name:
    @just _create-worktree {{ quote(type) }} {{ quote(name) }} print

[script]
_create-worktree type name mode:
    branch_prefix={{ quote(branch_prefix) }}
    worktrees_dir={{ quote(worktrees_dir) }}
    worktree_type={{ quote(type) }}
    worktree_name={{ quote(name) }}
    mode={{ quote(mode) }}
    slug="$(printf '%s' "$worktree_name" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//')"
    if [ -z "$slug" ]; then
      echo "Name must contain at least one alphanumeric character after slugification." >&2
      exit 1
    fi
    branch="$branch_prefix/$worktree_type/$slug"
    repo_root="$(git rev-parse --show-toplevel)"
    mkdir -p "$repo_root/$worktrees_dir"
    worktree_root="$(cd "$repo_root/$worktrees_dir" && pwd)"
    worktree_dir_name="$(printf '%s' "$branch" | tr '/' '-')"
    worktree_path="$worktree_root/$worktree_dir_name"
    if git show-ref --verify --quiet "refs/heads/$branch" || git show-ref --verify --quiet "refs/remotes/origin/$branch"; then
      echo "Branch already exists: $branch" >&2
      exit 1
    fi
    git worktree add -b "$branch" "$worktree_path"
    if [ -x "$worktree_path/scripts/link-env.sh" ]; then
      "$worktree_path/scripts/link-env.sh"
    fi
    case "$mode" in
      shell)
        echo "Activated worktree: $worktree_path"
        cd "$worktree_path"
        exec "${SHELL:-zsh}" -l
        ;;
      print)
        echo "Agent worktree: $worktree_path"
        echo "Branch: $branch"
        ;;
      *)
        echo "Unknown worktree mode: $mode" >&2
        exit 1
        ;;
    esac

# Verify, push, and open a draft pull request for the current branch.
[script]
agent-finish:
    branch="$(git branch --show-current)"
    if [ -z "$branch" ]; then
      echo "Could not determine the current branch." >&2
      exit 1
    fi
    if [ "$branch" = "main" ] || [ "$branch" = "master" ]; then
      echo "Refusing to finish directly from $branch." >&2
      exit 1
    fi
    if [ -n "$(git status --short)" ]; then
      echo "Working tree has uncommitted changes. Commit or stash them before finishing." >&2
      git status --short
      exit 1
    fi
    npm run lint
    npm run build
    git push -u origin "$branch"
    if gh pr view --json number --jq .number >/dev/null 2>&1; then
      gh pr view --web
    else
      gh pr create --draft --fill
    fi

# Stage and commit all current changes.
[script]
commit-all message:
    git add --all
    git commit -m {{ quote(message) }}
