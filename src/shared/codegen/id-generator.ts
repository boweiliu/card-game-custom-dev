#!/usr/bin/env node

/**
 * Code generator for ID prefix types and constants
 * 
 * Can read from:
 * 1. CLI: "EntityName: 'prefix'"
 * 2. TypeScript file with {EntityName}MetaPrefix export
 * 
 * Example: "Protocard: 'pc'" or file with "export const ProtocardMetaPrefix = 'pc';"
 * 
 * Generates:
 * - Prefix constants for DB and Client variants
 * - TypeScript types for each prefix
 * - Order types for sorting
 */

import * as fs from 'fs';
import * as path from 'path';

interface EntityConfig {
  name: string;
  prefix: string;
  sourceFile?: string;
}

function parseEntityConfig(input: string): EntityConfig {
  // Parse "EntityName: 'prefix'" format
  const match = input.match(/^(\w+):\s*['"](\w+)['"]$/);
  if (!match) {
    throw new Error(`Invalid input format. Expected "EntityName: 'prefix'", got: ${input}`);
  }
  
  return {
    name: match[1],
    prefix: match[2]
  };
}

function parseEntityFromFile(filePath: string): EntityConfig[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const configs: EntityConfig[] = [];
  
  // Check if file has // GEN: source marker
  const hasGenSource = /\/\/\s*GEN:\s*source/i.test(content);
  
  if (hasGenSource) {
    // Match patterns like: export const ProtocardMetaPrefix = 'pc';
    // Exclude lines with // GEN: ignore or regular comments
    const metaPrefixRegex = /^(?!.*\/\/\s*GEN:\s*ignore)(?!.*\/\/(?!\s*GEN:)).*export\s+const\s+(\w+)MetaPrefix\s*=\s*['"](\w+)['"];?/gmi;
    
    let match;
    while ((match = metaPrefixRegex.exec(content)) !== null) {
      const entityName = match[1];
      const prefix = match[2];
      
      configs.push({
        name: entityName,
        prefix: prefix,
        sourceFile: filePath
      });
    }
  }
  
  return configs;
}

function findDataLayerFiles(dir: string, files: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip generated directories to avoid infinite loops
      if (entry.name === 'generated') {
        continue;
      }
      
      if (entry.name === 'data-layer' || fullPath.includes('data-layer')) {
        // Found data-layer directory, scan for .ts files
        findTsFiles(fullPath, files);
      } else {
        // Recurse into other directories
        findDataLayerFiles(fullPath, files);
      }
    }
  }
  
  return files;
}

function findTsFiles(dir: string, files: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip generated directories to avoid infinite loops
      if (entry.name === 'generated') {
        continue;
      }
      findTsFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function scanDataLayerFiles(rootDir: string = 'src'): EntityConfig[] {
  if (!fs.existsSync(rootDir)) {
    throw new Error(`Root directory not found: ${rootDir}`);
  }
  
  // Find all TypeScript files in data-layer directories
  const files = findDataLayerFiles(rootDir);
  
  const allConfigs: EntityConfig[] = [];
  
  for (const file of files) {
    try {
      const configs = parseEntityFromFile(file);
      allConfigs.push(...configs);
    } catch (error) {
      // Skip files that don't have the expected patterns or have errors
      // This is normal for data-layer files that aren't ID source files
    }
  }
  
  if (allConfigs.length === 0) {
    throw new Error(`No files with "// GEN: source" marker found in ${rootDir}/**/data-layer/**/*.ts. Add "// GEN: source" to files that should generate IDs.`);
  }
  
  return allConfigs;
}

function generatePrefixConstants(config: EntityConfig): string {
  const upperName = config.name.toUpperCase();
  const prefix = config.prefix;
  
  return `export const _PREFIXES = {
  // DB
  ${upperName}_ENTITY: '${prefix}e_',
  ${upperName}_VERSION: '${prefix}v_',
  ${upperName}_SNAPSHOT: '${prefix}s_',
  // Client
  ${upperName}_ENTITY_CLIENT: '${prefix}f_',
  ${upperName}_VERSION_CLIENT: '${prefix}w_',
  ${upperName}_SNAPSHOT_CLIENT: '${prefix}t_',
} as const`;
}

function generateTypes(config: EntityConfig): string {
  const pascalName = config.name;
  const upperName = config.name.toUpperCase();
  
  return `export type ${pascalName}EntityId = PrefixedId<typeof _PREFIXES.${upperName}_ENTITY>;
export type ${pascalName}VersionId = PrefixedId<typeof _PREFIXES.${upperName}_VERSION>;
export type ${pascalName}SnapshotId = PrefixedId<typeof _PREFIXES.${upperName}_SNAPSHOT>;
export type ${pascalName}EntityClientId = PrefixedId<typeof _PREFIXES.${upperName}_ENTITY_CLIENT>;
export type ${pascalName}VersionClientId = PrefixedId<typeof _PREFIXES.${upperName}_VERSION_CLIENT>;
export type ${pascalName}SnapshotClientId = PrefixedId<typeof _PREFIXES.${upperName}_SNAPSHOT_CLIENT>;`;
}

function generateOrderTypes(config: EntityConfig): string {
  const pascalName = config.name;
  const lowerName = config.name.toLowerCase();
  
  return `export type ${pascalName}EntityOrder = (number | string) & { __${lowerName}_entity_order: true };
export type ${pascalName}VersionOrder = (number | string) & { __${lowerName}_version_order: true };
export type ${pascalName}SnapshotOrder = (number | string) & { __${lowerName}_snapshot_order: true };
export type ${pascalName}EntityClientOrder = (number | string) & { __${lowerName}_entity_client_order: true };
export type ${pascalName}VersionClientOrder = (number | string) & { __${lowerName}_version_client_order: true };
export type ${pascalName}SnapshotClientOrder = (number | string) & { __${lowerName}_snapshot_client_order: true };`;
}

// NOTE(bowei): this is the good one
function generateIdFile(input: string): string {
  const config = parseEntityConfig(input);
  
  const header = `
import { PrefixedId } from "@/shared/types/id-prefixes;
import { AssertExtends, TypeBlob } from "@/shared/data-layer/types";


/**
 * Generated by: ${process.argv[1]}
 * Generated from "${config.name}: '${config.prefix}'"
 */

`;

  const prefixes = generatePrefixConstants(config);
  const types = generateTypes(config);
  const orderTypes = generateOrderTypes(config);
  const typeBlob = generateTypeBlob(config);
  
  return header + prefixes + '\n\n' + types + '\n\n' + orderTypes + '\n\n' + typeBlob;
}

function generateTypeBlob(config: EntityConfig): string {
  const pascalName = config.name;
  const lowerName = config.name.toLowerCase();
  
  return `
export type ${pascalName}TypeBlob = {
  'clientEntityId': ${pascalName}EntityClientId;
  'clientVersionId': ${pascalName}VersionClientId;
  'clientSnapshotId': ${pascalName}SnapshotClientId;
  'serverEntityId': ${pascalName}EntityId;
  'serverVersionId': ${pascalName}VersionId;
  'serverSnapshotId': ${pascalName}SnapshotId;

  'clientEntityOrder': ${pascalName}EntityClientOrder;
  'clientVersionOrder': ${pascalName}VersionClientOrder;
  'clientSnapshotOrder': ${pascalName}SnapshotClientOrder;
  'serverEntityOrder': ${pascalName}EntityOrder;
  'serverVersionOrder': ${pascalName}VersionOrder;
  'serverSnapshotOrder': ${pascalName}SnapshotOrder;
}

type _check = AssertExtends<${pascalName}TypeBlob, TypeBlob>;
`;
}

function generateIdFileFromFile(filePath: string): string {
  const configs = parseEntityFromFile(filePath);
  
  if (configs.length === 0) {
    throw new Error(`No entities found in ${filePath}. Make sure file has "// GEN: source" marker and {EntityName}MetaPrefix exports.`);
  }
  
  if (configs.length === 1) {
    // Single entity - generate normally
    const config = configs[0];
    const header = `import { PrefixedId } from "@/shared/types/id-prefixes";


/**
 * Generated from file: ${filePath}
 * Entity: ${config.name} with prefix '${config.prefix}'
 */

`;

    const prefixes = generatePrefixConstants(config);
    const types = generateTypes(config);
    const orderTypes = generateOrderTypes(config);
    
    return header + prefixes + '\n\n' + types + '\n\n' + orderTypes + '\n';
  } else {
    // Multiple entities - generate all in one file
    const header = `import { PrefixedId } from "@/shared/types/id-prefixes";


/**
 * Generated from file: ${filePath}
 * Entities: ${configs.map(c => `${c.name} ('${c.prefix}')`).join(', ')}
 */

`;

    const allPrefixes = configs.map(generatePrefixConstants).join('\n\n');
    const allTypes = configs.map(generateTypes).join('\n\n');
    const allOrderTypes = configs.map(generateOrderTypes).join('\n\n');
    
    return header + allPrefixes + '\n\n' + allTypes + '\n\n' + allOrderTypes + '\n';
  }
}

function watchDataLayerFiles(rootDir: string = 'src'): void {
  console.log(`🔍 Watching ${rootDir}/**/data-layer/**/*.ts for changes...`);
  
  // Initial generation
  try {
    generateIdFileFromScan(rootDir, true);
  } catch (error) {
    console.error('Initial generation failed:', error instanceof Error ? error.message : String(error));
  }
  
  // Set up file watcher
  const watchedFiles = new Set<string>();
  
  function updateWatchedFiles() {
    try {
      const files = findDataLayerFiles(rootDir);
      const newFiles = files.filter(f => !watchedFiles.has(f));
      const removedFiles = Array.from(watchedFiles).filter(f => !files.includes(f));
      
      // Add new files to watch
      newFiles.forEach(file => {
        watchedFiles.add(file);
        fs.watchFile(file, { interval: 1000 }, (curr, prev) => {
          if (curr.mtime !== prev.mtime) {
            console.log(`📝 File changed: ${path.relative(process.cwd(), file)}`);
            try {
              generateIdFileFromScan(rootDir, true);
            } catch (error) {
              console.error('Generation failed:', error instanceof Error ? error.message : String(error));
            }
          }
        });
        console.log(`👀 Watching: ${path.relative(process.cwd(), file)}`);
      });
      
      // Remove old files from watch
      removedFiles.forEach(file => {
        watchedFiles.delete(file);
        fs.unwatchFile(file);
        console.log(`❌ Stopped watching: ${path.relative(process.cwd(), file)}`);
      });
    } catch (error) {
      console.error('Failed to update watched files:', error instanceof Error ? error.message : String(error));
    }
  }
  
  // Initial setup
  updateWatchedFiles();
  
  // Also watch for new data-layer directories
  function watchDataLayerDirectories(dir: string) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Skip generated directories to avoid infinite loops
          if (entry.name === 'generated') {
            continue;
          }
          
          if (entry.name === 'data-layer' || fullPath.includes('data-layer')) {
            // Watch data-layer directories for new files
            fs.watch(fullPath, { recursive: true }, (eventType, filename) => {
              if (filename && filename.endsWith('.ts') && !filename.includes('generated/')) {
                console.log(`📂 Data-layer file ${eventType}: ${filename}`);
                setTimeout(updateWatchedFiles, 100); // Debounce
              }
            });
          } else {
            // Recurse into other directories
            try {
              watchDataLayerDirectories(fullPath);
            } catch (error) {
              // Skip directories we can't access
            }
          }
        }
      }
    } catch (error) {
      // Skip directories we can't access
    }
  }
  
  watchDataLayerDirectories(rootDir);
  
  console.log('💡 Press Ctrl+C to stop watching');
  
  // Keep the process alive
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping file watcher...');
    watchedFiles.forEach(file => fs.unwatchFile(file));
    process.exit(0);
  });
}

function generateIdFileFromScan(rootDir: string = 'src', writeFiles: boolean = false): string | void {
  const configs = scanDataLayerFiles(rootDir);
  
  if (writeFiles) {
    // Group by source file and write individual files
    const fileGroups = configs.reduce((acc, config) => {
      const file = config.sourceFile || 'unknown';
      if (!acc[file]) acc[file] = [];
      acc[file].push(config);
      return acc;
    }, {} as Record<string, EntityConfig[]>);
    
    const writtenFiles: string[] = [];
    
    for (const [sourceFile, fileConfigs] of Object.entries(fileGroups)) {
      // Determine output path: source/file.ts -> source/generated/ids.ts
      const sourceDir = path.dirname(sourceFile);
      const generatedDir = path.join(sourceDir, 'generated');
      const outputPath = path.join(generatedDir, 'ids.ts');
      
      // Create generated directory if it doesn't exist
      if (!fs.existsSync(generatedDir)) {
        fs.mkdirSync(generatedDir, { recursive: true });
      }
      
      // Generate content for this file's entities
      let content: string;
      if (fileConfigs.length === 1) {
        const config = fileConfigs[0];
        const header = `import { PrefixedId } from "@/shared/types/id-prefixes";


/**
 * Generated from: ${path.relative(process.cwd(), sourceFile)}
 * Entity: ${config.name} with prefix '${config.prefix}'
 */

`;
        const prefixes = generatePrefixConstants(config);
        const types = generateTypes(config);
        const orderTypes = generateOrderTypes(config);
        
        content = header + prefixes + '\n\n' + types + '\n\n' + orderTypes + '\n';
      } else {
        const header = `import { PrefixedId } from "@/shared/types/id-prefixes";


/**
 * Generated from: ${path.relative(process.cwd(), sourceFile)}
 * Entities: ${fileConfigs.map(c => `${c.name} ('${c.prefix}')`).join(', ')}
 */

`;
        const allPrefixes = fileConfigs.map(generatePrefixConstants).join('\n\n');
        const allTypes = fileConfigs.map(generateTypes).join('\n\n');
        const allOrderTypes = fileConfigs.map(generateOrderTypes).join('\n\n');
        
        content = header + allPrefixes + '\n\n' + allTypes + '\n\n' + allOrderTypes + '\n';
      }
      
      // Write the file
      fs.writeFileSync(outputPath, content);
      writtenFiles.push(outputPath);
    }
    
    console.log(`✅ Generated ID files:`);
    writtenFiles.forEach(file => console.log(`   ${path.relative(process.cwd(), file)}`));
    return;
  }
  
  // Return combined content for console output (original behavior)
  if (configs.length === 1) {
    // Single entity found across all files
    const config = configs[0];
    const header = `import { PrefixedId } from "@/shared/types/id-prefixes";


/**
 * Generated from scanning ${rootDir}/**/data-layer/**/*.ts
 * Found in: ${config.sourceFile}
 * Entity: ${config.name} with prefix '${config.prefix}'
 */

`;

    const prefixes = generatePrefixConstants(config);
    const types = generateTypes(config);
    const orderTypes = generateOrderTypes(config);
    
    return header + prefixes + '\n\n' + types + '\n\n' + orderTypes + '\n';
  } else {
    // Multiple entities found - group by source file
    const fileGroups = configs.reduce((acc, config) => {
      const file = config.sourceFile || 'unknown';
      if (!acc[file]) acc[file] = [];
      acc[file].push(config);
      return acc;
    }, {} as Record<string, EntityConfig[]>);
    
    const header = `import { PrefixedId } from "@/shared/types/id-prefixes";


/**
 * Generated from scanning ${rootDir}/**/data-layer/**/*.ts
 * Sources: ${Object.keys(fileGroups).join(', ')}
 * Entities: ${configs.map(c => `${c.name} ('${c.prefix}')`).join(', ')}
 */

`;

    const allPrefixes = configs.map(generatePrefixConstants).join('\n\n');
    const allTypes = configs.map(generateTypes).join('\n\n');
    const allOrderTypes = configs.map(generateOrderTypes).join('\n\n');
    
    return header + allPrefixes + '\n\n' + allTypes + '\n\n' + allOrderTypes + '\n';
  }
}

// CLI usage
if (require.main === module) {
  const input = process.argv[2];
  if (!input) {
    console.error('Usage:');
    console.error('  node id-generator.ts "EntityName: \'prefix\'"');
    console.error('  node id-generator.ts --file path/to/file.ts');
    console.error('  node id-generator.ts --scan [rootDir]');
    console.error('  node id-generator.ts --scan --write [rootDir]');
    console.error('  node id-generator.ts --scan --watch [rootDir]');
    console.error('Examples:');
    console.error('  node id-generator.ts "Protocard: \'pc\'"');
    console.error('  node id-generator.ts --file src/shared/data-layer/protocards/protocards.ts');
    console.error('  node id-generator.ts --scan src');
    console.error('  node id-generator.ts --scan --write src  # Write files to generated/ dirs');
    console.error('  node id-generator.ts --scan --watch src  # Watch and auto-generate');
    process.exit(1);
  }
  
  try {
    let generated: string | void = undefined;
    
    if (input === '--file') {
      const filePath = process.argv[3];
      if (!filePath) {
        console.error('Error: --file flag requires a file path');
        process.exit(1);
      }
      generated = generateIdFileFromFile(filePath);
    } else if (input === '--scan') {
      const hasWriteFlag = process.argv.includes('--write');
      const hasWatchFlag = process.argv.includes('--watch');
      
      if (hasWatchFlag && !hasWriteFlag) {
        console.error('Error: --watch requires --write flag');
        process.exit(1);
      }
      
      const rootDirIndex = Math.max(
        hasWriteFlag ? process.argv.indexOf('--write') + 1 : 0,
        hasWatchFlag ? process.argv.indexOf('--watch') + 1 : 0,
        process.argv.indexOf('--scan') + 1
      );
      const rootDir = process.argv[rootDirIndex] || 'src';
      
      if (hasWatchFlag) {
        watchDataLayerFiles(rootDir);
        // watchDataLayerFiles never returns (runs until Ctrl+C)
      } else {
        generated = generateIdFileFromScan(rootDir, hasWriteFlag);
      }
    } else {
      generated = generateIdFile(input);
    }
    
    if (generated) {
      console.log(generated);
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Export for programmatic use
export { generateIdFile, generateIdFileFromFile, generateIdFileFromScan, watchDataLayerFiles, parseEntityConfig, parseEntityFromFile, scanDataLayerFiles };