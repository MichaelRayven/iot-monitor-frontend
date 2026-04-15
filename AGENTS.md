# AGENTS.md

## Purpose

This project is a modern React + TypeScript application built with simplicity, maintainability, and performance in mind.
All changes must follow **Occam’s razor**: choose the simplest solution that correctly solves the problem.

## Commands
- Install: `pnpm install`
- Dev server: `pnpm run dev`
- Build: `pnpm run build`
- Lint: `pnpm run lint`
- Lint fix: `pnpm run lint:fix`
- Format: `pnpm run format`
- Stylelint: `pnpm run stylelint`
- Tests: `pnpm run test:run`

---

## Core Principles

### 1. Simplicity First

* Prefer simple, readable solutions over clever or abstract ones.
* Avoid premature optimization and over-engineering.
* Do not introduce patterns, libraries, or abstractions without clear need.

### 2. Local Reasoning

* Code should be understandable within a single file or small scope.
* Avoid implicit behavior and hidden side effects.
* Minimize cross-file dependencies.

### 3. Single Responsibility

* Each function/component should do one thing.
* If something is hard to name, it is likely doing too much.

### 4. Composition Over Abstraction

* Prefer composing small components/functions rather than building complex abstractions.
* Avoid inheritance-like patterns.

---

## Tech Stack

* pnpm (package manager)
* React (functional components only)
* TypeScript (strict mode)
* Vite
* Tailwind CSS
* ESLint + Prettier
* Vitest (browser mode with Playwright)

---

## Project Structure

```
src/
  app/            # app-level setup (providers, routing)
  features/       # domain features (preferred)
  shared/         # reusable components, utils, hooks
  components/     # generic UI components (if not feature-specific)
  hooks/          # shared hooks
  utils/          # pure utility functions
  styles/         # global styles
  test/           # test setup
```

### Rules

* Prefer **feature-based structure** over type-based.
* Keep related code close together.
* Avoid deeply nested folders.

---

## Components

### Guidelines

* Use **function components only**
* Keep components small and focused
* Split when:

  * component exceeds ~100–150 lines
  * contains multiple logical responsibilities

### Example

```tsx
function UserCard({ user }: Props) {
  return (
    <div className="p-4 border rounded">
      <UserAvatar user={user} />
      <UserInfo user={user} />
    </div>
  );
}
```

---

## State Management

### Rules

1. Start with **local state (`useState`)**
2. Lift state only when necessary
3. Use **context sparingly**
4. Avoid global state unless truly required

### Avoid

* unnecessary global stores
* deeply nested context trees

---

## Data Fetching

* Keep data fetching close to usage
* Prefer simple hooks:

```ts
function useUser(id: string) {
  // fetch logic here
}
```

* Avoid complex data layers unless required

---

## Hooks

### Rules

* Keep hooks small and focused
* Prefix with `use`
* Do not mix unrelated logic

### Bad

```ts
useUserAndThemeAndSettings()
```

### Good

```ts
useUser()
useTheme()
useSettings()
```

---

## Styling

* Use Tailwind CSS utilities
* Avoid custom CSS unless necessary
* Do not introduce SCSS

### Rules

* Keep class lists readable
* Extract complex UI into components instead of long class strings

---

## Types

* Always type props and function inputs
* Prefer explicit types over `any`
* Use inference where obvious

### Example

```ts
type Props = {
  user: User;
};
```

---

## Testing

* Use Vitest
* Prefer simple, deterministic tests

### Guidelines

* Test behavior, not implementation
* Avoid over-mocking
* Keep tests readable

### Structure

```
Component.test.tsx
useSomething.test.ts
```

---

## Error Handling

* Fail early
* Use clear error messages
* Do not silently ignore errors

---

## Naming

* Use clear, descriptive names
* Avoid abbreviations
* Prefer nouns for components, verbs for functions

---

## Imports

* Keep imports minimal
* Remove unused imports
* Avoid deep relative paths when possible

---

## Performance

* Optimize only when needed
* Avoid premature memoization
* Use `useMemo` / `useCallback` only when measurable benefit exists

---

## Git & Workflow

### Commits

* Keep commits small and focused
* One logical change per commit

### Before committing

* Code passes ESLint
* Code is formatted with Prettier
* Tests pass (if applicable)

---

## What to Avoid

* Over-abstraction
* “Smart” generic utilities
* Deep inheritance patterns
* Large monolithic components
* Hidden side effects
* Unnecessary dependencies

---

## Decision Checklist

Before adding anything, ask:

1. Is this the simplest solution?
2. Can this be done with existing tools?
3. Will this make the code easier to understand?
4. Is this solving a real problem?

If any answer is “no”, do not proceed.

---

## Summary

* Keep it simple
* Keep it local
* Keep it explicit
* Build only what is needed

The best code is the code that is easy to read, easy to change, and hard to break.
