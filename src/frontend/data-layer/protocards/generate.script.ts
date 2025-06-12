import { Project } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

// Initialize a new project
const project = new Project();

// Read the contents of the source file
const sourceFilePath = path.join(__dirname, 'crud.ts');
const sourceFileContent = fs.readFileSync(sourceFilePath, 'utf-8');

// Create a new source file in the project
const sourceFile = project.createSourceFile('generated/protocards.ts', sourceFileContent);

// Add some generated code (example)
sourceFile.addInterface({
    name: 'GeneratedInterface',
    properties: [
        { name: 'id', type: 'string' },
        { name: 'name', type: 'string' }
    ]
});

// Save the generated file
sourceFile.saveSync();

console.log('TypeScript code generated successfully!');
