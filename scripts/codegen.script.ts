import { execSync } from 'child_process';
import * as path from 'path';

function runScript(scriptPath: string) {
    const absolutePath = path.join(__dirname, scriptPath);
    execSync(`node ${absolutePath}`, { stdio: 'inherit' });
}

// List of code generation scripts
const scripts = [
    '../src/frontend/data-layer/protocards/generate.ts',
    // Add paths to other generate scripts here
];

// Execute each script
scripts.forEach(runScript);

console.log('All code generation scripts executed successfully.');
