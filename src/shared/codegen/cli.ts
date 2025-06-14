#!/usr/bin/env node

/**
 * CLI entry point for ID generator
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

import { generateIdFile, generateIdFileForEntity, parseEntityConfig } from './code-generator';
import { processEntityFile, processScannedEntities, watchDataLayerFiles } from './file-scanner';

// CLI usage
if (require.main === module) {
  const input = process.argv[2];
  if (!input) {
    console.error('Usage:');
    console.error('  node cli.ts "EntityName: \'prefix\'"');
    console.error('  node cli.ts --file path/to/file.ts');
    console.error('  node cli.ts --scan [rootDir]');
    console.error('  node cli.ts --scan --write [rootDir]');
    console.error('  node cli.ts --scan --watch [rootDir]');
    console.error('Examples:');
    console.error('  node cli.ts "Protocard: \'pc\'"');
    console.error('  node cli.ts --file src/shared/data-layer/protocards/protocards.ts');
    console.error('  node cli.ts --scan src');
    console.error('  node cli.ts --scan --write src  # Write files to generated/ dirs');
    console.error('  node cli.ts --scan --watch src  # Watch and auto-generate');
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
      generated = processEntityFile(filePath, generateIdFileForEntity);
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
        watchDataLayerFiles(rootDir, generateIdFileForEntity);
        // watchDataLayerFiles never returns (runs until Ctrl+C)
      } else {
        generated = processScannedEntities(rootDir, generateIdFileForEntity, hasWriteFlag);
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
export { generateIdFile, processEntityFile, processScannedEntities, watchDataLayerFiles };