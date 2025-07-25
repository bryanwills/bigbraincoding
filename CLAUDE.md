# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Plan & Review

### Before starting work
- Always in plan mode to make a plan
- After getting the plan, make sure you write the plan to .claude/tasks/TASK_NAME.md.
- The plan should be a detailed implementation plan and the reasoning behind them, as well as tasks broken down.
- If the task requires external knowledge or a certain package, also research how to get the latest knowledge (Use Task tool for research)
- Don't over plan it, always think MVP.
- Once you write the plan, first ask me to review it. Do not continue until I approve the plan.

### While implementing
- You should update the plan as you work.
- After you complete tasks in the plan, you should update and append detailed descriptions of the changes you made, so following tasks can be easily handed over to other engineers.
- Be sure to track everything via Git, if there is no Git initialized, initialize and start tracking.
- Before making any major changes, create a PR for the change as you normally would and then associate the commit with the corresponding PR. For example, adding a hamburger menu to mobile view would be one PR created before implementing the hamburger menu. Once the implementation has completed, add all the changes related to it to git and relate it to the corresponding PR.

### After completing the task
- Once you complete the task, ask me to review the changes.
- If I approve the changes, you can commit the changes.
- If I ask for changes, you should update the plan and ask me to review again.
- If I approve the changes, you can commit the changes.
- If I ask for changes, you should update the plan and ask me to review again.
- If I approve the changes, you can commit the changes.
- If I ask for changes, you should update the plan and ask me to review again.

## Project Overview

This repository contains structured workflow documentation for implementing TODO tasks using Claude Code. It provides two different approaches:

1. **Branch-based workflow** (`todo-branch.md`) - Works on current branch with single commit
2. **Worktree-based workflow** (`todo-worktree.md`) - Uses git worktrees for task isolation and VS Code integration

## Workflow Architecture

Both workflows follow the same core phases:
- **INIT**: Project analysis and setup
- **SELECT**: Choose todo from list
- **REFINE**: Research and plan implementation
- **IMPLEMENT**: Execute with validation
- **COMMIT**: Clean up and commit changes

### Key Workflow Requirements

When implementing these workflows:
- Follow phases sequentially with user confirmation at each STOP
- Use parallel Task agents for codebase analysis during INIT and REFINE phases
- Never mention Claude in commit messages or add as committer
- Stage all files during IMPLEMENT phase
- Run project validation (lint/test/build) after implementation
- Update project descriptions when structure changes

### File Structure Expectations

The workflows expect this directory structure:
```
todos/
├── project-description.md    # Project overview and commands
├── todos.md                 # List of pending todos
├── work/                    # Active tasks (branch workflow)
├── worktrees/              # Git worktrees (worktree workflow)
└── done/                   # Completed tasks
```

### Task Management

Tasks are tracked in markdown files with this structure:
- Status tracking (Refining → InProgress → AwaitingCommit → Done)
- Agent PID for orphaned task detection
- Implementation plan with checkboxes
- Analysis from codebase research

### Git Integration

- Branch workflow: Single branch with staged commits
- Worktree workflow: Isolated worktrees with PR creation
- Both support task resumption via PID tracking
- Automatic gitignore management for worktrees

## Usage Notes

- Reference the appropriate workflow file when implementing TODO management
- Use parallel Task agents extensively for codebase analysis
- Maintain strict phase ordering with user confirmation points
- Handle orphaned tasks through PID-based detection

## Repository Overview

This directory contains a minimal web application consisting of a single `index.html` file. The HTML file references a Vite-based React/TypeScript application structure with references to `/src/main.tsx` and `/vite.svg`, but the actual source code and build configuration are not present in this directory.

## Current State

The repository currently contains:
- `index.html` - Main HTML entry point referencing React/TypeScript components
- `.claude/` - Directory for Claude Code configuration

## Development Notes

This appears to be either:
1. A production build output directory where the source files have been compiled/bundled
2. A placeholder directory for a web application that hasn't been fully set up yet
3. A deployment target directory where the actual development happens elsewhere

Since no package.json, build scripts, or source code are present, standard Node.js/React development commands are not available in this directory.

## Recommendations

If this is intended to be a development repository, consider adding:
- `package.json` with build scripts and dependencies
- Source code in a `src/` directory
- Build configuration (e.g., `vite.config.ts`)
- Development dependencies and tooling