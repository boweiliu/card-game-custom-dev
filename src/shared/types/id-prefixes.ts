// Centralized ID prefix system for easy identification of entity types

// ID prefix constants
export const ID_PREFIXES = {
  // Database entity prefixes
  PROTOCARD: 'pc_',
  GAME_CARD: 'gc_',
  GAME_HISTORY: 'gh_',
  GAME_SNAPSHOT: 'gs_',
  GAME_ACTION: 'ga_',

  // Message correlation ID prefixes
  MESSAGE: 'msg_',
  PENDING_MESSAGE: 'pmsg_',

  // Temporary/pending entity prefixes
  TEMPORARY_ENTITY: 'tmp_',
} as const;

// Helper type to extract prefix values
export type IDPrefix = (typeof ID_PREFIXES)[keyof typeof ID_PREFIXES];

// Generic branded ID type with prefix validation
export type PrefixedId<T extends string> = string & {
  __prefixed_id: true;
  __prefix: T;
};

// New prefixed ID types (for future use)
export type PrefixedProtocardId = PrefixedId<typeof ID_PREFIXES.PROTOCARD>;
export type GameCardId = PrefixedId<typeof ID_PREFIXES.GAME_CARD>;
export type GameHistoryId = PrefixedId<typeof ID_PREFIXES.GAME_HISTORY>;
export type PrefixedGameSnapshotId = PrefixedId<
  typeof ID_PREFIXES.GAME_SNAPSHOT
>;
export type PrefixedGameActionId = PrefixedId<typeof ID_PREFIXES.GAME_ACTION>;
export type PrefixedMessageID = PrefixedId<typeof ID_PREFIXES.MESSAGE>;
export type PrefixedPendingMessageID = PrefixedId<
  typeof ID_PREFIXES.PENDING_MESSAGE
>;
export type PrefixedPendingEntityId = PrefixedId<
  typeof ID_PREFIXES.TEMPORARY_ENTITY
>;

// Legacy ID types (for backward compatibility during transition)
export type ProtocardId = number & { __protocard_id: true };
export type MessageID = (string | number) & { __message_id: true };
export type PendingMessageID = (string | number) & {
  __pending_message_id: true;
};
export type PendingEntityId = string & { __pending_entity_id: true };

// ID generation utilities
export class IDGenerator {
  private static counters: Record<string, number> = {};

  /**
   * Generate a new ID with the specified prefix using base36 (56 chars + 8 for prefix = 64 total)
   */
  static generate<T extends IDPrefix>(prefix: T): PrefixedId<T> {
    const timestamp = Date.now().toString(36);
    // Math.random().toString(36) gives "0.abc123..." so .substring(2) removes "0."
    const random1 = Math.random().toString(36).substring(2);
    const random2 = Math.random().toString(36).substring(2);
    // Combine timestamp + 2 random strings, then truncate to exactly 56 chars
    const combined = (timestamp + random1 + random2).substring(0, 56);
    return `${prefix}${combined}` as PrefixedId<T>;
  }

  /**
   * Validate that an ID has the expected prefix
   */
  static validatePrefix<T extends IDPrefix>(
    id: string,
    expectedPrefix: T
  ): id is PrefixedId<T> {
    return id.startsWith(expectedPrefix);
  }

  /**
   * Extract the prefix from an ID
   */
  static getPrefix(id: string): string | null {
    const prefixValues = Object.values(ID_PREFIXES);
    const foundPrefix = prefixValues.find((prefix) => id.startsWith(prefix));
    return foundPrefix || null;
  }

  /**
   * Convert a legacy numeric ID to a prefixed ID
   */
  static fromLegacyId<T extends IDPrefix>(
    numericId: number,
    prefix: T
  ): PrefixedId<T> {
    return `${prefix}${numericId}` as PrefixedId<T>;
  }
}
