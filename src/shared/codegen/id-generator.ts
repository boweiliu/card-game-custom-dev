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
  
  return `const PREFIXES = {
  // DB
  ${upperName}_ENTITY: '${prefix}e_',
  ${upperName}_VERSION: '${prefix}v_',
  ${upperName}_SNAPSHOT: '${prefix}s_',
  // Client
  ${upperName}_ENTITY_CLIENT: '${prefix}f_',
  ${upperName}_VERSION_CLIENT: '${prefix}w_',
  ${upperName}_SNAPSHOT_CLIENT: '${prefix}t_',
}`;
}

function generateTypes(config: EntityConfig): string {
  const pascalName = config.name;
  const upperName = config.name.toUpperCase();
  
  return `export type ${pascalName}EntityId = PrefixedId<typeof PREFIXES.${upperName}_ENTITY>;
export type ${pascalName}VersionId = PrefixedId<typeof PREFIXES.${upperName}_VERSION>;
export type ${pascalName}SnapshotId = PrefixedId<typeof PREFIXES.${upperName}_SNAPSHOT>;
export type ${pascalName}EntityClientId = PrefixedId<typeof PREFIXES.${upperName}_ENTITY_CLIENT>;
export type ${pascalName}VersionClientId = PrefixedId<typeof PREFIXES.${upperName}_VERSION_CLIENT>;
export type ${pascalName}SnapshotClientId = PrefixedId<typeof PREFIXES.${upperName}_SNAPSHOT_CLIENT>;`;
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

function generateIdFile(input: string): string {
  const config = parseEntityConfig(input);
  
  const header = `import { PrefixedId } from "@/shared/types/id-prefixes";


/**
 * Generated from "${config.name}: '${config.prefix}'"
 */

`;

  const prefixes = generatePrefixConstants(config);
  const types = generateTypes(config);
  const orderTypes = generateOrderTypes(config);
  
  return header + prefixes + '\n\n' + types + '\n\n' + orderTypes + '\n';
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

function generateIdFileFromScan(rootDir: string = 'src'): string {
  const configs = scanDataLayerFiles(rootDir);
  
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
    console.error('Examples:');
    console.error('  node id-generator.ts "Protocard: \'pc\'"');
    console.error('  node id-generator.ts --file src/shared/data-layer/protocards/protocards.ts');
    console.error('  node id-generator.ts --scan src');
    process.exit(1);
  }
  
  try {
    let generated: string;
    
    if (input === '--file') {
      const filePath = process.argv[3];
      if (!filePath) {
        console.error('Error: --file flag requires a file path');
        process.exit(1);
      }
      generated = generateIdFileFromFile(filePath);
    } else if (input === '--scan') {
      const rootDir = process.argv[3] || 'src';
      generated = generateIdFileFromScan(rootDir);
    } else {
      generated = generateIdFile(input);
    }
    
    console.log(generated);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Export for programmatic use
export { generateIdFile, generateIdFileFromFile, generateIdFileFromScan, parseEntityConfig, parseEntityFromFile, scanDataLayerFiles };