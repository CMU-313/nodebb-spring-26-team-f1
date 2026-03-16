# Fast-Fuzz User Input Guide

This guide explains how to run the Fast-Fuzz harness from the command line, what it covers, and how to add new fuzz targets.

## How Fast-Fuzz works in this repo

Fast-Fuzz is a **TypeScript-only** fuzzer. It uses the `tplant` library to parse type information from `.ts` source files, then pairs that with compiled `.d.ts` and `.js` files in the `dist/` folder to discover and run decorated methods.

> **Important:** The existing NodeBB codebase is plain JavaScript and is not directly fuzzable. All fuzz targets must be written as TypeScript classes in `src/fuzz/`, compiled to `dist/fuzz/`, and decorated with Fast-Fuzz decorators.

## Current fuzz targets

The active target is `src/fuzz/userInputFuzzTarget.ts`, which contains three methods wrapping user-input validation logic:

| Method | What it validates |
|---|---|
| `validateUsername` | Length (3–16), allowed characters, no repeated separators |
| `validateEmail` | Format, length cap (100 chars), required `@` and domain |
| `validateBio` | Length cap (500 chars), rejects `<script>` tags |

## Prerequisites

Install dependencies:

```bash
npm install
```

## Run from command line

| Command | Purpose |
|---|---|
| `npm run fuzz:user-input` | Standard run (reuses existing `fuzzInstances.json`) |
| `npm run fuzz:user-input:verbose` | Shows method count, timing, and per-method progress |
| `npm run fuzz:user-input:force` | Regenerates `fuzzInstances.json` from scratch |
| `npm run build:fuzz-targets` | Compile TypeScript targets only, without running the fuzzer |

Direct node invocation:

```bash
node scripts/fuzz-user-input.js
```

## What the runner does

1. Compiles `src/fuzz/*.ts` to `dist/fuzz/` using `tsconfig.fast-fuzz.json`.
2. Calls Fast-Fuzz pointed at `src/fuzz` (TypeScript sources) and `dist/fuzz` (compiled output).
3. Fast-Fuzz discovers all methods decorated with `@fuzzMethod`, generates random inputs for each `@fuzzArg`, and records which inputs cause new branch coverage.
4. Results are written to `logs/fast-fuzz-user-input-results.json`.

## Output

Results are written to `logs/fast-fuzz-user-input-results.json`. Each entry in the array corresponds to one fuzzed method:

```json
[
  {
    "name": "validateUsername",
    "className": "UserInputFuzzTarget",
    "file": "...",
    "avgSpeed": 10.989,
    "results": [
      {
        "id": 1,
        "mode": "Falsy",
        "args": [""],
        "result": {},
        "coverageHash": "g3y64d",
        "runCount": 1
      }
    ]
  }
]
```

- `result: {}` means the method threw an exception (Fast-Fuzz catches errors and records them as empty objects).
- `result: true` (or any value) means the method returned normally with that input.
- `mode` describes the input strategy: `Falsy` tries empty/null values first; `Low_1` tries literals extracted from the source code.
- `coverageHash` is a unique identifier for the branch path exercised by that input.

`fuzzInstances.json` at the project root is written by Fast-Fuzz to record discovered object instances for reuse in multi-function integration testing.

## Adding new fuzz targets

Open `src/fuzz/userInputFuzzTarget.ts` and add a new method to the `UserInputFuzzTarget` class:

```typescript
import { fuzzArg, fuzzMethod } from 'fast-fuzz-shim/dist/fast-fuzz';

export class UserInputFuzzTarget {

  @fuzzMethod
  validateMyField(
    @fuzzArg('string', 0, 0, 255) value: string
  ): boolean {
    // your validation logic here
    return true;
  }
}
```

Then run:

```bash
npm run fuzz:user-input:force
```

The `@fuzzArg` decorator accepts: `'boolean' | 'integer' | 'float' | 'date' | 'string'` as the first argument, followed by array dimension (0 = scalar), min, and max.

## Runtime options (environment variables)

| Variable | Default | Description |
|---|---|---|
| `FAST_FUZZ_THREADS` | `0` | Number of threads. 0 = in-process. |
| `FAST_FUZZ_MAX_TIME` | `60000` | Max time per method in milliseconds. |
| `FAST_FUZZ_VERBOSE` | `0` | Set to `1` for verbose output including method count and timing. |
| `FAST_FUZZ_FORCE` | `0` | Set to `1` to regenerate `fuzzInstances.json`. |
| `FAST_FUZZ_SOURCE` | `src/fuzz` | TypeScript source folder (relative to project root). |
| `FAST_FUZZ_DIST` | `dist/fuzz` | Compiled output folder (relative to project root). |
| `FAST_FUZZ_FILES` | `userInputFuzzTarget\.js$` | Regex to filter which compiled files are fuzzed. |
| `FAST_FUZZ_BUILD_CMD` | `npx tsc -p tsconfig.fast-fuzz.json` | Command used to compile targets before each run. |

Example with overrides:

```bash
FAST_FUZZ_VERBOSE=1 \
FAST_FUZZ_MAX_TIME=120000 \
FAST_FUZZ_FORCE=1 \
node scripts/fuzz-user-input.js
```

## Troubleshooting

**`Method count: 0` in verbose output**
Fast-Fuzz found no decorated methods. Check that:
- `src/fuzz/*.ts` exists and has `@fuzzMethod`-decorated methods
- `dist/fuzz/*.js` and `dist/fuzz/*.d.ts` exist (run `npm run build:fuzz-targets`)
- `FAST_FUZZ_FILES` pattern matches the compiled `.js` file name

**`fuzzInstances.json` is empty (`{}`)**
Normal on the first run or when all fuzzed methods throw exceptions. Fast-Fuzz only populates instances from methods that return successfully.

**Build errors during run**
TypeScript compilation errors will surface as a `[fast-fuzz] Target build failed` message with the compiler output. Fix the errors in `src/fuzz/*.ts` and re-run.
