# Claude Code Available Tools

This document lists all tools available to Claude Code in this project.

## Available Tools

1. **Task** - Launch a new agent with access to search and analysis tools
2. **Bash** - Execute bash commands in persistent shell session
3. **Glob** - Fast file pattern matching with glob patterns
4. **Grep** - Fast content search using regular expressions
5. **LS** - List files and directories at given path
6. **Read** - Read files from local filesystem (supports images)
7. **Edit** - Perform exact string replacements in files
8. **MultiEdit** - Make multiple edits to single file in one operation
9. **Write** - Write/overwrite files to local filesystem
10. **NotebookRead** - Read Jupyter notebook (.ipynb) files
11. **NotebookEdit** - Edit specific cells in Jupyter notebooks
12. **WebFetch** - Fetch and analyze content from URLs
13. **TodoRead** - Read current session todo list
14. **TodoWrite** - Create and manage structured task lists
15. **WebSearch** - Search the web for current information

## Current Session State

**Last Updated:** 2025-05-25 16:18 PST
**Branch:** feature/db-path-env
**Recent Work:** Implemented DB_PATH environment variable configuration (TODO #18)

### Active Todo List
- ✅ Pull latest dev branch and create feature branch for #18
- ✅ Analyze TODO #18 requirements for DB_PATH
- ✅ Implement DB_PATH fixes for dev and prod

### Recent Commits
- ed08a1c: Implement DB_PATH environment variable for database configuration
- Created PR #4 targeting dev branch

### Environment
- Working Directory: /home/bowei/code/CascadeProjects/cards-claude-2
- Git Worktree: feature/db-path-env
- Platform: linux (WSL2)
- Model: claude-sonnet-4-20250514

## Tool Usage Notes

- Prefer Task tool for open-ended searches requiring multiple rounds
- Use Glob for file pattern matching, Grep for content search
- Read tool supports images and handles large files with offset/limit
- Edit/MultiEdit for precise file modifications
- TodoRead/TodoWrite for task management and progress tracking
- Bash tool has timeout limits and security restrictions
- All file paths must be absolute, not relative

## Security & Restrictions

- Bash tool avoids `find`, `grep`, `cat` commands (use dedicated tools instead)
- File operations require absolute paths
- Some commands have timeout limits (default 2 minutes, max 10 minutes)
- Web tools may have domain restrictions