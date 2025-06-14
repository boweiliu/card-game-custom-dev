/**
 * File system operations for scanning and watching TypeScript files
 */

import * as fs from 'fs';
import * as path from 'path';
import { EntityConfig } from './code-generator';

type EntityProcessor = (config: EntityConfig, context: string) => string;

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

function processEntityFile(filePath: string, processor: EntityProcessor): string {
  const configs = parseEntityFromFile(filePath);
  
  if (configs.length === 0) {
    throw new Error(`No entities found in ${filePath}. Make sure file has "// GEN: source" marker and {EntityName}MetaPrefix exports.`);
  }
  
  if (configs.length === 1) {
    // Single entity - generate normally
    const config = configs[0];
    return processor(config, filePath);
  } else {
    throw new Error(`Multiple entities found in ${filePath}. Each prefix should be in its own file.`);
  }
}

function processScannedEntities(rootDir: string, processor: EntityProcessor, writeFiles: boolean = false): string | void {
  const configs = scanDataLayerFiles(rootDir);
  
  if (writeFiles) {
    const writtenFiles: string[] = [];
    
    for (const config of configs) {
      const sourceFile = config.sourceFile || 'unknown';
      // Determine output path: source/file.ts -> source/generated/{entityName}-ids.ts
      const sourceDir = path.dirname(sourceFile);
      const generatedDir = path.join(sourceDir, 'generated');
      const outputPath = path.join(generatedDir, `${config.name.toLowerCase()}-ids.ts`);
      
      // Create generated directory if it doesn't exist
      if (!fs.existsSync(generatedDir)) {
        fs.mkdirSync(generatedDir, { recursive: true });
      }
      
      // Generate content for this entity
      const content = processor(config, path.relative(process.cwd(), sourceFile));
      
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
    return processor(config, `scanning ${rootDir}/**/data-layer/**/*.ts, found in: ${config.sourceFile}`);
  } else {
    throw new Error(`Multiple entities found. Each prefix should be in its own file. Found: ${configs.map(c => `${c.name} ('${c.prefix}')`).join(', ')}`);
  }
}

function watchDataLayerFiles(rootDir: string, processor: EntityProcessor): void {
  console.log(`🔍 Watching ${rootDir}/**/data-layer/**/*.ts for changes...`);
  
  // Initial generation
  try {
    processScannedEntities(rootDir, processor, true);
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
              processScannedEntities(rootDir, processor, true);
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

export { 
  EntityProcessor,
  parseEntityFromFile, 
  scanDataLayerFiles, 
  processEntityFile, 
  processScannedEntities, 
  watchDataLayerFiles 
};