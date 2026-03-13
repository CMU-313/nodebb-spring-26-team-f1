'use strict';

require('reflect-metadata');

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let fuzz;
try {
	({ fuzz } = require('fast-fuzz-shim'));
} catch (err) {
	// fast-fuzz-shim@1.0.5 ships an incorrect package main path.
	({ fuzz } = require('fast-fuzz-shim/dist/fast-fuzz'));
}

const projectFolder = path.resolve(__dirname, '..');

// Fast-Fuzz requires TypeScript sources and compiled dist output.
// We point it at the dedicated src/fuzz and dist/fuzz sub-trees so it can
// cross-reference .ts types (via tplant) with compiled .d.ts + .js files.
const source = process.env.FAST_FUZZ_SOURCE || 'src/fuzz';
const dist = process.env.FAST_FUZZ_DIST || 'dist/fuzz';

// File pattern is relative to the dist folder — target the compiled JS.
const filePattern = process.env.FAST_FUZZ_FILES || 'userInputFuzzTarget\\.js$';

const threads = Number(process.env.FAST_FUZZ_THREADS || 0);
const maxTime = Number(process.env.FAST_FUZZ_MAX_TIME || 60000);
const verbose = process.env.FAST_FUZZ_VERBOSE === '1';
const force = process.env.FAST_FUZZ_FORCE === '1';

const buildCommand = process.env.FAST_FUZZ_BUILD_CMD || 'npx tsc -p tsconfig.fast-fuzz.json';

const outputFile = path.join(projectFolder, 'logs', 'fast-fuzz-user-input-results.json');
const fuzzInstancesFile = path.join(projectFolder, 'fuzzInstances.json');

async function main() {
	fs.mkdirSync(path.dirname(outputFile), { recursive: true });
	fs.mkdirSync(path.join(projectFolder, dist), { recursive: true });

	// Compile fuzz targets before running so dist/ matches the current src/fuzz sources.
	try {
		execSync(buildCommand, { cwd: projectFolder, stdio: 'pipe' });
	} catch (err) {
		const stderr = err && err.stderr ? String(err.stderr) : '';
		const stdout = err && err.stdout ? String(err.stdout) : '';
		throw new Error(`[fast-fuzz] Target build failed. Command: ${buildCommand}\n${stdout}${stderr}`);
	}

	// Fast-Fuzz pushes result objects into this array as it runs each method.
	// The same array is returned by fuzz() when complete.
	const resultsOut = [];

	await fuzz(
		projectFolder,
		threads,
		maxTime,
		undefined,
		undefined,
		filePattern,
		source,
		dist,
		verbose,
		force,
		resultsOut
	);

	if (resultsOut.length > 0) {
		fs.writeFileSync(outputFile, JSON.stringify(resultsOut, null, 2));
		console.log(`[fast-fuzz] Discovered ${resultsOut.length} method result(s). Results: ${outputFile}`);
	} else {
		let fuzzInstancesPreview = null;
		if (fs.existsSync(fuzzInstancesFile)) {
			try {
				fuzzInstancesPreview = fs.readFileSync(fuzzInstancesFile, 'utf8');
			} catch (err) {
				fuzzInstancesPreview = '[unreadable]';
			}
		}
		fs.writeFileSync(outputFile, JSON.stringify({
			note: 'Fast-Fuzz completed but discovered 0 methods.',
			hint: 'Ensure src/fuzz/*.ts is compiled to dist/fuzz/ and the file pattern matches the compiled .js file names.',
			timestamp: new Date().toISOString(),
			projectFolder,
			source,
			dist,
			filePattern,
			maxTime,
			threads,
			fuzzInstancesPreview,
		}, null, 2));
		console.log(`[fast-fuzz] No methods discovered. Check ${outputFile} for details.`);
	}
}

main().catch((err) => {
	console.error('[fast-fuzz] Fuzz run failed:', err);
	process.exitCode = 1;
});
