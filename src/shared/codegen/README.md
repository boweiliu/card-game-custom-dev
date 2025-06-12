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

# Via npm scripts
npm run generate:ids "EntityName: 'prefix'"
npm run generate:ids:file path/to/file.ts
npm run generate:ids:scan [rootDir]
```

### Examples

```bash
# Generate from string
npm run generate:ids "Protocard: 'pc'"
npm run generate:ids "GameCard: 'gc'"

# Generate from file
npm run generate:ids:file src/shared/data-layer/protocards/protocards.ts
npm run generate:ids:file src/shared/data-layer/gamecards/gamecards.ts
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

The generated code imports from `@/shared/types/id-prefixes` and follows the existing ID system patterns. Output can be saved to files like `src/shared/data-layer/{entity}/generated/ids.ts`.

## Programmatic Usage

```typescript
import { generateIdFile, parseEntityConfig } from '@/shared/codegen/id-generator';

const generated = generateIdFile("MyEntity: 'me'");
console.log(generated);
```