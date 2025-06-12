# ID Generator Codegen

This module generates TypeScript ID types and constants from simple input specifications.

## Usage

### CLI

```bash
# From string input
npx ts-node src/shared/codegen/id-generator.ts "EntityName: 'prefix'"

# From TypeScript file
npx ts-node src/shared/codegen/id-generator.ts --file path/to/file.ts

# Scan all data-layer files
npx ts-node src/shared/codegen/id-generator.ts --scan [rootDir]

# Scan and write files to generated/ directories
npx ts-node src/shared/codegen/id-generator.ts --scan --write [rootDir]

# Watch data-layer files and auto-regenerate
npx ts-node src/shared/codegen/id-generator.ts --scan --write --watch [rootDir]

# Via npm scripts
npm run generate:ids "EntityName: 'prefix'"
npm run generate:ids:file path/to/file.ts
npm run generate:ids:scan [rootDir]
npm run generate:ids:write [rootDir]
npm run generate:ids:watch [rootDir]
```

### Examples

```bash
# Generate from string
npm run generate:ids "Protocard: 'pc'"
npm run generate:ids "GameCard: 'gc'"

# Generate from file
npm run generate:ids:file src/shared/data-layer/protocards/protocards.ts
npm run generate:ids:file src/shared/data-layer/gamecards/gamecards.ts

# Scan all data-layer files (recommended)
npm run generate:ids:scan src
npm run generate:ids:scan

# Generate and write files (recommended for development)
npm run generate:ids:write
npm run generate:ids:write src

# Watch mode for active development (recommended)
npm run generate:ids:watch
npm run generate:ids:watch src
```

## Input Formats

### String Input
The input string must follow this exact format:
```
"EntityName: 'prefix'"
```

- `EntityName`: PascalCase entity name (e.g., "Protocard", "GameCard", "User")
- `prefix`: Short prefix string (e.g., "pc", "gc", "u")

### File Input
TypeScript files with exports in this format:
```typescript
export const EntityNameMetaPrefix = 'prefix';
```

Examples:
```typescript
export const ProtocardMetaPrefix = 'pc';
export const GameCardMetaPrefix = 'gc';
// export const CardMetaPrefix = 'ca';  // Commented lines are ignored
```

The generator will find all `{EntityName}MetaPrefix` exports and generate IDs for each.

### GEN Markers
Files must have `// GEN: source` marker to be included in scanning:
```typescript
// GEN: source
export const ProtocardMetaPrefix = 'pc';

// GEN: ignore  
// export const CardMetaPrefix = 'ca';  // This line is ignored
```

- `// GEN: source`: Marks file as ID source (required for scanning)
- `// GEN: ignore`: Excludes specific lines from generation
- Regular `//` comments: Also excluded from generation

## Generated Output

For input `"Protocard: 'pc'"`, generates:

### Prefix Constants
```typescript
const PREFIXES = {
  // DB
  PROTOCARD_ENTITY: 'pce_',
  PROTOCARD_VERSION: 'pcv_',
  PROTOCARD_SNAPSHOT: 'pcs_',
  // Client
  PROTOCARD_ENTITY_CLIENT: 'pcf_',
  PROTOCARD_VERSION_CLIENT: 'pcw_',
  PROTOCARD_SNAPSHOT_CLIENT: 'pct_',
}
```

### ID Types
```typescript
export type ProtocardEntityId = PrefixedId<typeof PREFIXES.PROTOCARD_ENTITY>;
export type ProtocardVersionId = PrefixedId<typeof PREFIXES.PROTOCARD_VERSION>;
// ... etc for all 6 variants
```

### Order Types
```typescript
export type ProtocardEntityOrder = (number | string) & { __protocard_entity_order: true };
// ... etc for all 6 variants
```

## Prefix Pattern

Each entity generates 6 ID types following this pattern:
- `{prefix}e_` - Entity (DB)
- `{prefix}v_` - Version (DB) 
- `{prefix}s_` - Snapshot (DB)
- `{prefix}f_` - Entity Client
- `{prefix}w_` - Version Client
- `{prefix}t_` - Snapshot Client

## Integration

The generated code imports from `@/shared/types/id-prefixes` and follows the existing ID system patterns.

## File Output

When using `--write` flag, files are automatically written to `generated/ids.ts` relative to the source file:

```
src/shared/data-layer/protocards/protocards.ts  # Source with // GEN: source
src/shared/data-layer/protocards/generated/ids.ts  # Generated output

src/backend/data-layer/users/users.ts  # Source with // GEN: source  
src/backend/data-layer/users/generated/ids.ts  # Generated output
```

The `generated/` directory is created automatically if it doesn't exist.

## Watch Mode

Watch mode (`--watch`) continuously monitors data-layer files for changes and automatically regenerates ID files:

```bash
npm run generate:ids:watch  # Watch src/**/data-layer/**/*.ts
```

Features:
- **Initial generation**: Generates all files on startup
- **File watching**: Monitors existing data-layer files for changes
- **Dynamic discovery**: Automatically watches new data-layer files as they're created
- **Loop prevention**: Excludes `generated/` directories to avoid infinite regeneration loops
- **Error handling**: Continues watching even if generation fails
- **Clean output**: Shows which files changed and were regenerated
- **Graceful shutdown**: Press Ctrl+C to stop watching

Perfect for active development where you're frequently updating entity prefixes!

## Programmatic Usage

```typescript
import { generateIdFile, parseEntityConfig } from '@/shared/codegen/id-generator';

const generated = generateIdFile("MyEntity: 'me'");
console.log(generated);
```