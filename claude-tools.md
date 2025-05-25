# Claude Code Available Tools

This document lists all available tools for Claude Code in this codebase.

## File Operations

### Task
- **Description**: Launch a new agent that has access to the following tools: Bash, Glob, Grep, LS, Read, Edit, MultiEdit, Write, NotebookRead, NotebookEdit, WebFetch, TodoRead, TodoWrite, WebSearch
- **When to use**: For searching keywords/files, open-ended research, complex multi-step tasks
- **When NOT to use**: For specific file paths (use Read/Glob), specific class definitions (use Glob), code within 2-3 files (use Read)

### Read
- **Description**: Reads a file from the local filesystem
- **Features**: Supports up to 2000 lines, line offset/limit, images, absolute paths required
- **Use cases**: Reading code files, configuration files, images, any file content

### Write  
- **Description**: Writes a file to the local filesystem
- **Requirements**: Must read existing files first, absolute paths required
- **Preference**: Always prefer editing existing files over creating new ones

### Edit
- **Description**: Performs exact string replacements in files with strict occurrence count validation
- **Requirements**: Preserve exact indentation, must match file content exactly including whitespace

### MultiEdit
- **Description**: Make multiple edits to a single file in one operation
- **Features**: Atomic operations (all succeed or none), sequential application of edits
- **Use cases**: When making several changes to different parts of the same file

### Glob
- **Description**: Fast file pattern matching tool that works with any codebase size
- **Patterns**: Supports glob patterns like "**/*.js" or "src/**/*.ts"
- **Returns**: Matching file paths sorted by modification time

### Grep
- **Description**: Fast content search tool using regular expressions
- **Features**: Full regex syntax, file filtering with include parameter
- **Returns**: File paths with matches sorted by modification time

### LS
- **Description**: Lists files and directories in a given path
- **Requirements**: Absolute paths only, optional glob patterns to ignore
- **Preference**: Generally prefer Glob and Grep tools when you know which directories to search

## Development Tools

### Bash
- **Description**: Executes bash commands in a persistent shell session with optional timeout
- **Features**: Up to 10 minutes timeout, concurrent execution support
- **Special rules**: 
  - Avoid `find`, `grep`, `cat`, `head`, `tail`, `ls` - use dedicated tools instead
  - Use `rg` (ripgrep) if grep is absolutely needed
  - Use `;` or `&&` for multiple commands, avoid newlines
  - Maintain working directory with absolute paths

### NotebookRead
- **Description**: Reads a Jupyter notebook (.ipynb file) and returns all cells with outputs
- **Requirements**: Absolute paths only

### NotebookEdit
- **Description**: Completely replaces contents of a specific cell in a Jupyter notebook
- **Features**: Support for replace, insert, delete operations
- **Requirements**: 0-indexed cell numbers, absolute paths

## Web & External

### WebFetch
- **Description**: Fetches content from a specified URL and processes it using an AI model
- **Features**: HTML to markdown conversion, 15-minute cache
- **Requirements**: Fully-formed valid URLs, HTTP automatically upgraded to HTTPS

### WebSearch
- **Description**: Allows Claude to search the web and use results to inform responses
- **Features**: Domain filtering (allowed/blocked), US availability only
- **Use cases**: Current events, information beyond Claude's knowledge cutoff

## Project Management

### TodoRead
- **Description**: Read the current to-do list for the session
- **Usage**: Should be used proactively and frequently, especially at conversation start, before new tasks, when uncertain about next steps

### TodoWrite
- **Description**: Create and manage a structured task list for your current coding session
- **When to use**: Complex multi-step tasks (3+ steps), non-trivial tasks, multiple user requests, after receiving new instructions
- **When NOT to use**: Single straightforward tasks, trivial tasks under 3 steps, purely conversational requests

## Tool Usage Guidelines

### Concurrency
- You can call multiple tools in a single response
- When multiple independent pieces of information are requested, batch tool calls together
- For multiple bash commands, send a single message with multiple tool calls to run in parallel

### Git Operations
- For commits: Run git status, git diff, git log in parallel to understand changes
- For PRs: Run git status, git diff, git log and `git diff main...HEAD` in parallel
- Use HEREDOC format for commit messages
- Never use git commands with -i flag (interactive)

### Error Handling
- Tool results may include <system-reminder> tags with useful information
- If a tool use is rejected, stop and wait for user guidance
- Handle file modifications by linters/users gracefully

### Security
- Never expose or log secrets and keys
- Never commit secrets to repository
- When needing sudo commands, write into a script for human execution