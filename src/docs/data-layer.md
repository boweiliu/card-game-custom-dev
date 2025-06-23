SPECS

1. Data append only ; internal representation is mostly append only (some ids, metadata etc. might be updated inplace)
2. Messages should be idempotent and reorderable, groupable into atomic units
2. synchronous local CRURM interface - create, read, update, resolve conflicts, migrate schema. Machinery happens async behind the hood. Can query synced state etc.
3. Enttity schema supports versioning, migrating, and backporting, per-entity
4. Messages can have atomic composite payloads, but can also be sent as batches
5. Each change has an author and many reviewers
6. Agnostic to server -- server is just a convenient name for the canonical reviewer
7. All merge conficts / race conditions happen in application layer
8. id == uuid; orderKey is real-valued because bitemporal; timestamp for logs; intid for autoincrementing logs; whoami id 
9. Client sessions may be shortlived for anonymity; base it off the whoamiId; single application can have many clients
10. Low mutual client trust -- store an internal personal id as well; key off of combo (whoamiId, uuid)
11. ~~store "parentCanonicalIds" for tracking merge necessity~~
12. Use checksums, diffs, whatever at the transport layer as needed
13. The connection of the server to its database is not in scope -- server can simply not ack the message if its database connection is bad.
14. How do clients query "indexes - getAll()" type stuff? ANS: if it's a collection, it needs its own id
14. How do clients deal with data loss? ANS: query someone else to remember your history.
14. AUTH?
15. Support peer to peer connections at the transport layer too: all clients made equal
16. How does reviewer selection aka leader election work? ANS: partial ordering, some clients (servers) are higher prio by agreement, but acceptance of priority by the other party is not guaranteed.
17. archival/data loss recovery/compaction is the same problem as client onboarding/"i dont know what this id refers to"
18. Transport layer is based on sync -> ack/nack/clarify handshakes. Bidir protocal, can be run over channels which are fire-forget, or request-response, or full bidir.
19. The nature of computed data... that should be an application concern. If it's truly computed, don't store it ; if it does need to be cached, then its not computed and something should manage that
20. WHAT IF : we stored the "linear" history as a separate thing from all the snapshots? again, separate the concerns, cuz merges are a completely separate entity usually (they require different UX, etc.). This would make linear history single-write which is nice.
    ANS: NO WAY!! linear history is a lie in a p2p context (split brain can happen at any time). Instead we should do explicit A, B -> (AB) merge pairs. Record coordinated acks somehow.
21. Make the schema versioning also store a human-readable data dictionary description; this helps with semantic changes where the shape is the same but the meaning is different
22. For the love of god let's make sure to version the transport protocal and really this whole data layer so we can make changes later if needed.
23. User-facing merge conflict flows are not in scope. data layer just handles conflict bag-of-X style
24. the overall goal = make it easy to write frontend that is optimistic, local-first, p2p, and doesn't have to worry about maanging my own transactions/bugs caused by stale state/batching etc.
25. Other goals: (contrast with automerge)
  a. Standardize sync vs async interface, and make it possible to prefer the sync one (separate those concerns)
  b. Similar interface on backend vs frontend, and the style that everyone understand (crud-like).
  c. All async data backends (file systems, database) should be treated to be as unreliable as a client. This might mean 2 backend clients: one which does biz logic and another which just persists to DB.
  d. you can just run multiple backends or multiple clients that talk to each other locally; very flexible on transport. Easy scaling of server AND databases.
26.  Other differences from automerge:
  a. state migration friendly.
  b. Standardish API interfaces at client/server as well as database and dom. This makes it easy to debug or introspect (curl + sql, unlike automerge binary blobs grr confusing)
  c. Untrusted write/verify can lead to anticheat stuff later.
  d. Opinionated ORM-like interface into both frontend and backend. (see b above)
  e. Language agnostic and automerge compatible. (The crdt can be imported from automerge; is another pluggable component)
  f. Don't care about cross-local file system stuff which automerge has fancy handling for.
  g. Planning to handle broadcast style one-to-many transports too. (Should still be done spoke-hub style)
27. be more careful about archiving old states, especially try not to delete the hashes if possible.
28. Also: rely on the synchro log.
29. Linear history is a lie but each client has linear history, maybe track that and track when folks synced with each other; have a snapshot, then each client has 1 branch (per version) (or maybe a finite number of branches), then keep "i send this snapshot to this other client and he reviewed it" <- these are "synchro logs".
30. Content-hashing the stuff where it makes sense (but still tag it with _creator to debug better)
31. Valet parking for database usage: have a database-only adapter which just acts like A's private data repo, and have those API routes separate from A actually talking to S to verify/validate/operate on the data.
  but watch out for abuse
32. Security/auth? Like what if a client says "whoami" and then someone else pretends to be that client? ans: plz handle at transport layer
33. We should have a neat CLI that interfaces with servers and clients equally; both session-ful and sessionless. Like if i want to CURl a single GET to a client, i should be able to do that, somehow
34. Separate about the clients: backend one should handle biz logic and be MOSTLY sync (with async inbound and outbound). Another backend one should handle database persistence, valet-style (that one is a lot of async). Client one should be sync, either backed by in mem or dom or sync indexdb, again with async inbound/outbound only. And those async parts should be structured to be easy to run in another non-js language, i.e. there's some awareness of event loop, doNext(), doAll(), doForever() type stuff.
35. Dont forget to solve the "write-then-read" problem. Should be trivial, but to be extra sure, build in debug flags to force clients to be slow on the reply.

Here's a sample flow with Clients A, B, and S:


* Application code calls create()
* Client A remembers its whoamiId (equivalently: sessionId) and creates 4 rows:
  1 Entity row with a uuid (created by client A)
  2 Version row, hashed as content: (entityId, version) -> versionHashId. Unmarked [except for debugging]
    Should also contain data dictionary info and cosupport/lossport/deprecate info. All that is defined in code, so should be consistent and hashable. Good to back it up into data layer anyways -- encourages updating the version upon any semantic changes.
  3 State row, hashed as content: (versionHashId, ...state) -> stateHashId.  Unmarked [except for debugging].
  4 Snapshot row, with uuid, orderKey, stateHashId, whoamiId: A, isCreator: true
    This represents that we've made a change locally, but no other clients have synchro'd with our snapshot.
* Store those 4 rows in memory
* Invoke async data backup valet to store it persistently, by using the idempotent connection layer:
  - Find a data backup valet (maybe this is just another client btw)
  - bundle up 4 rows as an atomic message -> syncMessageId
  - store ( syncMessageId -> message ) in the transport layer buffer
  - send (syncId, whoamiId) to the valet, wait for it to be acked with (syncId, whoamiId, ackId, whoareuId)
  - once it's acked, remove it from the transport layer buffer, and instead replace it with ( syncMessageId <-> ackMessageId ) in the transport layer buffer
  - if it's not acked immediately, or it's nacked, put it in a retry queue, with the requested nack logic if present
* concurrently: send those 4 atomic rows to another client B
  - use the same transport idempotency logic as above
  - However, this time, since B is a client and not just a valet, B is responsible for generating its own ids .
  - B's state should look like:
    1 Entity row with A's uuid, A's whoamiId, but also it gets the standard internal metadata: _uuid, _orderKey, _createdAt (which are all relative to B)
    2 Version row, no change, except we verify the hash matches. if not - nack with error, but also rehash (so we will have duplicate rows + alias column of incorrect -> correct hash) and continue
    3 State row, no change, similarly check hash match and continue if error
    4 Snapshot row with A's uuid, A's orderKey, A's whoamId, [possibly incorrect] stateHashId, isCreator: true
    5 Now B adds their own snapshot row that looks like: B's uuid, B's orderKey, B's whoamId, stateHashId, isCreator: false. This signifies that B has seen the snapshot and aligned it in B's ordering of states, and reviewed A's biz logic if appropriate.
* B needs to send back row 5 (B's snpashot) to A using the same idempotent transport. A stores it (and backs it up)
    
Next, suppose A makes 2 quick updates.
* Application code calls update() and then update()
* If these are in the same sync thread, then the 2 updates get batched at the data layer and create just a single update.
* More interestingly though, let's suppose these are 2 separate async updates (say the user did a double click or something)
* A's datalayer generates 4 rows, in 2 pairs:
  6 state hash
  7 snapshot pointing to stateHash6
  8 state hash
  9 snapshot pointing to stateHash8
* A backs up its 2+2 rows as usual and sends them to B in 2 atomic pairs.
* Suppose B receives the atomic 8 + 9 first. B replies with 10: B's snapshot synchronizing 9, which A stores.
* Now B receives the atomic 6 + 7. B checks the order keys and notes that this is a retroactive update, so B will not write a synchro row; it will simply ack the message, save the row, and move on.

In another universe, A and B each make changes and send them to each other.
* B has made and send B1 but now receives A1.
* B records A1 and generates B2 = B1 + A1 (merge determined by B) and tags it with orderKey, whoamiId, and isCreator: true
* B sends B2 to A, implicitly requesting synchro
* Maybe A has done the same on their side, writing A1, then receiving B1, so creating A2 = A1 + B1 before receiving B2.
* A should know that B2 is a A1 + B1 merge (i guess we should record it in the row). if it's the same contentHash as A2, then both A and B should use whoever's whoamiId is lower to decide the winner, and send one final snapshot with isCreator: false (aka a reviewal)
* If the conflict is irresolvable (say, someone set the field to X and someone else to Y) then someone needs to inform their users of the collision and get them to resolve. If the resolution is delayed it looks a lot like a hard fork ("I took the red lego block for my farmhouse, you took the red block for your ambulance. both of us built a lot of stuff on top. Now someone has to give up their block, or we can both continue in our own worlds until we decide whose is better"). During the fork the 2 parties really can't resolve conflicts at all -- if A3 comes after A2, but B has noticed that A2 is in conflict with (B2, B3....), then A3 should be nacked.
  - How? We should definitely store the last synchro row. For B3 for instance, the last synchro row from A is A1 (created by A but NOT reviewed by B since it was in conflict at the time), and the last full synchro is 0, and the last attempted merge from our side was B2. For the A3 message, they think the last synchro from us(B) was B1, and the last full synchro was 0, and the last attempted merge was A2. In other words, us accepting A3 is contingent on us accepting the merge A2, because A2 contains B1. OR - equivalently; A3 is a descendent of B1 but not anything else in our history, but we know B2 (and posssibly more stuff) came after B1, so we will try to merge in A3 and find the same merge conflict during B2 = 0 | B1 + A1, but now it looks like B9 = B1 | B8 + A3 . We know we sent B2 first and didn't get a response yet. but we can still send B9 (since it's tagged as a B8 + A3 merged) and maybe it's acceptable.
  - Of course this is all in the case where A and B are equal clients and neither wants to accept the other's merge resolutions. If it's a server vs client case (hopefully prenegotiated that one client has priority), then B's merge algorithm should be to accept merge resolutions from S over any local merges.

* To summarize,
  - Snapshots have types:
    Creations (content hash, creator)
    Merges (they store the 2 (+?) branches and the common ancestor)
    Reviewals (of either creations or merges)
  - When sending snapshots to you, atomically also send:
    The last synchro from us (something {created or reviewed} by both of us)
    The last creation from you (if more recent from above)
  - If I am trying to resolve/review a merge and have a bunch of history missing, there's a special transport query syntax to request a range of stuff that i've forgotten/need you to resend
    
## Explicit data shapes

Below is **pseudocode** (TypeScript-flavoured) that captures the core tables / rows and transport envelopes described in the spec.  It is intentionally high-level and omits implementation details such as persistence adapters or concrete codecs.

```typescript
// ---------- Component types ----------
export type string<T> = "T";                // string literal constant 
export type Id<T> = string;                 // branded id type, usually a prefixed string. [; ] reserved chars for separators.
export type WhoamiId = Id<"client">;        // identifier for a client, or so they claim. [; ] reserved chars for separators.
export type Key<T> = string;                // computed, guarnateed to be globally unique across ALL tables (Ids can be reused per-client)
export type Sortable = number;              // Floating point, used so we can back insert bitemporal keys into a strict linear order. Obviously ints are a subtype.
export type IntId = int;                    // Auto-incrementing positive integer; only useful for local ordering
export type LocalTimestamp = string;        // Datetime in utc, recorded locally, ms precision. ISO string.
export type Timestamp = string;             // Datetime in utc, recorded on a remote machine, so maybe not reliable
export type Hash<T> = string;               // Arbitrarily lets decide on md5 hash of JSON.stringify(indent=False, sortKeys=True, js implementation)
                                            // All zeroes is reserved for the empty object

// Entity head - defines what we are talking about.
// Main use is provides a tracking key for all data relevant to this instance.
export interface EntityRow<T> {
  creatorId: WhoamiId;
  entityId: Id<this>;         // only unique per-creator
  createdAt: Timestamp;       // local to creator
  createdOrder: Sortable;     // bitemporal linear order, but only per-creator

  // Local only
  _key: Key<this> computedAs ';'.join("T", entityId, creatorId);
  _id: IntId;
  _recordedAt: LocalTimestamp;
  _localOrder: Sortable;       // the globally correct bitemporal order that we think things are in
  _debug: any; // Any log-line appropriate information, e.g. the triggering threadId, api endpoint, stacktrace, whatever
}

// A bundle of data that represents a version of the schema
// All of the following data should match whatever is in the code
export interface EntitySchemaBlob<T> {
  entityType: string<T>;      // What type of thing we are talking about
  version: Version = string;  // whatever we need; either integer, or major.minor.patch. 0 , "" are reserved for "default ver". [; ] reserved chars for separators.
                              // This all comes from the same codebase, so it SHOULD be globally well-ordered!
  gitCommit: string;          // JUST in case we are doing migrations off of git branches or something...
  docstring: string;          // multiline docs indicating the semantic meaning and intended use of all the fields.
                              // If any docs are updated -> we need a new version!!

  // Which other versions of this entity are in what state, in sorted order.
  // The current version is always primary (otherwise, why are you, locally, creating this row?)
  // Next is a list of other live versions that are capable of storing the exact same data as the current primary version
  // Then comes older versions which we want to support, but may have, say missing states due to newly added fields, or incorrect fields that we removed
  // Optionally, finally, a list of states which are now EOL and we will or are not capable of backporting. If not listed, all other versions are asssumed to be EOL.
  // This array MUST be sorted and MUST contain the full list of all live, and backporting versions. It must also contain newly EOL'd versions.
  _deprecates: { version: Version; status: "primary" | "colive" | "backporting" | "eol" }[];

  deprecatesColive: ';'.join(Version[]);       // Flat stye for flat DB's.
  deprecatesBackporting: ';'.join(Version[]);
  deprecatesEol: ';'.join(Version[]);

  _hash: Hash<this> computedAs hash(this); // Hashes the non-underscore fields only!!

  _key: Key<this> = _hash;
  _recordedAt: LocalTimestamp;
  _id: IntId;
  _debug: any;
  // this is not a bitemporal (or temporal, at all) row, so doesn't need creatorOrder/localOrder.

  // For debug + convenience
  _creatorId: WhoamiId;       // who sent us this and when. Might be ourselves.
  _createdAt: Timestamp;
}

// A tracking key to coordinate any data saying that entity "entityId" is under the version "version".
// Intentionally not tagged with creator, etc. because it will be content-addressed. we want any client independently
// to be able to promote any entity instance independently to a specific version.
export interface EntityVersionBlob<T> {
  entityId: Key<Entity> references ... ;
  schemaHash: Hash<EntitySchemaBlob> references ... ;

  _hash: Hash<this> computedAs hash(this);

  _key: Key<this> = _hash;
  _recordedAt: LocalTimestamp;
  _id: IntId;
  _debug: any;
  // this is not a bitemporal (or temporal, at all) row, so doesn't need creatorOrder/localOrder.

  // For debug + convenience
  _version: Version computedAs schemaHash.version;
  _creatorId: WhoamiId;       // who sent us this and when. Might be ourselves.
  _createdAt: Timestamp;
}

// Concrete, hashable business state (may be CRDT payload). Content-addressed.
export interface EntityStateBlob<T> {
  [key]: any;

  _hash: Hash<this> computedAs hash(this); // maybe also be the empty hash (all zeroes)

  _key: Key<this> = _hash;
  _recordedAt: LocalTimestamp;
  _id: IntId;
  _debug: any;

  // For debug + convenience
  _entityType: string<T> computedAs ...
  _version: Version computedAs ...
  _creatorId: WhoamiId;
  _createdAt: Timestamp;
}

// Also known as: EntityStateHistoryBlob. Linked list style version history;
// content-addressed by sequence of changes.
export interface CommitBlob {
  // must reference an actual CommitBlob not just a EntityStateBlob, otherwise 
  // if we make the exact same incremental change twice there's no way to diff them
  fromStates: SingeletonOrArray<Hash<CommitBlob>>; // often just a singleton. If array, order matters.
  mergeAncestor?: Hash<CommitBlob> // empty if just 1 parent (it's implied to be just the parent)
  toState: Hash<EntityStateBlob>;

  _diff: Hash<EntityDiffBlob>; // TODO: this will compress things quite a bit
}

// Expresses the fact that the entity id + entity version is now in a given state.
export interface EntityStateRow {
  versionHash: Hash<EntityVersionBlob>; // the topic of what we are talking about .
  // Reminder that this contains:
    entityId: Id<T>
    schemaHash: Hash
      version: VersionString
      docstring: string
      deprecates: ...
      

  entityStateId: Id<this>; // rowId

  commitHash: Hash<CommitBlob>
  // Reminder that this contains:
    fromStates: SingeletonOrArray<Hash<CommitBlob>>;
    mergeAncestor?: Hash<CommitBlob>;
    toState: Hash<EntityStateBlob>;

  creatorId: WhoamiId;
  createdAt: Timestamp;
  createdOrder: IntId;
  // For rows that I write (with creatorId === me),
  // the createdOrder is integer sequential

  // For any specific commitHash, here are the valid states:
  // createdBy = me ONLY, type = ack-accepted. (I just authored the commit and haven't received a remote review yet)
  //   shorthand: (me, ack-accepted)
  // 
  // Note that either you or I must have authored it, so either you or I must have it as accepted.
  //
  // (me, accepted) + (you, empty) == I just authored and you haven't responded yet.
  //                                  OR you're still working on the merge.
  // (me, accepted) + (you, accepted) == We both agree on the change.
  // (me, accepted) + (you, change-requested) == I made the change and you merged it in and sent me the merge.
  // (me, change-requested) + (you, accepted) == you made the change and I had a merge which i sent to you.
  // (me, empty) + (you, accepted) == you made the change and I'm still in the process of merging
  // (me, empty) + (you, empty) == it doesn't exist lol
  //
  // Invalid/3rd party states:
  // (me, empty) + (you, change-requested) == 3rd party again
  // (me, change-requested) + (you, empty) == very weird, probably means 3rd party diff
  // (me, change-requested) + (you, change-requested) == also smells like 3rd party

  // (me, ack-accepted) + (you, ack-accepted). This means I made the change and you reviewed and accepted; OR vice versa
  // (you, ack-accepted). An intermediate state, this means I'm trying to merge this commit but haven't yet.
  // (you, ack-accepted) + (me, ack-seen). The same as above, pretty much.

  // For debug + convenience
  _version: Version computedAs ...
  _entityId: Id computedAs ...
  _originalAuthorId: WhoamiId // Might be disagreed upon

  // Local only
  _key: Key<this> computedAs ';'.join("T", versionHash, commitHash, creatorId)
  _id: IntId;
  _recordedAt: LocalTimestamp;
  _debug: any; // Any log-line appropriate information, e.g. the triggering threadId, api endpoint, stacktrace, whatever
}

/**
 * The processing logic goes as follows:
 * 
 * I receive a EntityStateRow.
 * Suppose the row has as creatorId = your whoamiId.
 *   (otherwise: there's some 3rd party logic we're not going to go into.)
 * I look at the commit hash, which references your full linear history of all diffs.
 * 
 * Let's assume there's no 3rd party, so either you or I created the diff, which means
 * one of us has it as "accepted".
 * 
 * Let's also assume I haven't already processed the exact same message by you.
 * 
 * Case 1: you are sending "ack-accepted" by you; by assumption this is new to me.
 * So my possible previous states are: (me, ack-accepted) + (you, empty), or (me, empty) + (you, empty).
 * 
 * 1a) - I think it's "ack-accepted by me, the original creator.
 *    Transition: (me, ack-accepted) + (you, empty) --> (me, ack-accepted) + (you, ack-accepted)
 * Then you are informing me that you are responding by acknowledging one of my own previous changes.
 * great. The result is that I will update my last-symmetrically-synced pointer to be this hash.
 * 
 * 1b) I don't have it at all. Then you are informing me of a new commit you made.
 *    Transition: (me, empty) + (you, empty) --> (me, ack-accepted/changes-requested) + (you, ack-accepted)
 * I have to process the change. Here is the logic:
 *   First I check what I think is your most recent change (i.e. from my view of your linear history, what is the
 *   highest sequential creatorOrder). If that's more recent than this message, I'm going to copy the state of 
 *   that most-recent message and resend that tip back. Basically do nothing and redo that thing.
 *   
 *   Otherwise, it seems you are sending me your newest update. You should have also sent me 
 *   what was the latest change ack-accepted by me that is in the component history of this change.
 *   If your latest view of me is accurate, then I simply ack-accept.
 *   Otherwise, I need to merge my latest with yours, 3-way using the base you told me, and send back the merge.
 *   (The actual merge algorithm is the hard part and I will leave up to implementation, documented in the 
 *    version schema for that version. For now, assume the merge algo is trivial - symbols, counters, or maps thereof)
 *   (Maybe the merge algo needs to know some number of intermediate merges too)
 * 
 * Case 2: you are sending "changes-requested" by you; by assumption your state was previously (you, empty).
 * Since you don't have it as "ack-accepted" by you, that must mean it was created by me.
 *    Transition: (me, ack-accepted) + (you, empty) --> (me, ack-accepted) + (you, changes-requested)
 * This means that there is guaranteed to be another commitHash ack-accepted by you, in the same atomic message,
 * so I don't need to do anything and this is actually the case 1b)
 */


/**
 * Merge rows capture an explicit merge operation: the child snapshot that
 * reconciles two (or more) divergent parent snapshots plus an optional
 * lowest common ancestor (§20, §108-110).
 */
export interface MergeRow {
  uuid: UUID;                     // Merge row id (unique per client)
  snapshotId: UUID;                // Child snapshot produced by the merge
  orderKey: OrderKey;             // Ordering value of the merge operation
  parentSnapshotIds: UUID[];       // ≥2 parent snapshot ids being reconciled
  commonAncestorId?: UUID;         // Optional lowest common ancestor snapshot id
  whoamiId: WhoamiId;              // Client performing the merge
  createdAt: Date;
}

// ---------- Transport & messaging ----------

/**
 * Atomic unit shipped over the wire – a logically immutable batch.
 */
export interface AtomicMessage {
  id: UUID;                       // Message idempotency key (§2)
  author: WhoamiId;               // Primary author (§5)
  rows: DataRow[];                // Any combination of *Row items
  reviewers: WhoamiId[];          // Peers that have reviewed/ACKed
  timestamp: Date;                // First creation time on author
}

/** Permitted row unions carried by a message */
export type DataRow =
  | EntityRow
  | VersionRow
  | StateRow
  | SnapshotRow
  | MergeRow
  | SynchroRow;

/**
 * Wire-level envelope with handshake semantics (ACK/NACK/CLARIFY – §18).
 */
export interface TransportEnvelope {
  message: AtomicMessage;
  handshake?: {
    code: "ack" | "nack" | "clarify";
    partial?: boolean;      // True when sender only has a partial range
    reason?: string;        // Filled on nack/clarify
  };
}

// ---------- Local change log ----------

export interface ChangeLogEntry {
  intId: IntId;                   // Local monotonic id (§8)
  orderKey: OrderKey;             // Mirrors Snapshot.orderKey when relevant
  messageId: UUID;               // FK → AtomicMessage.id
  whoamiId: WhoamiId;             // Author / executor of the change
  hashChecksum?: string;          // Optional integrity checksum (§12)
  timestamp: Date;
}

// ---------- Client session ----------

export interface ClientSession {
  whoamiId: WhoamiId;             // Stable per logical device / tab
  internalId: UUID;               // Extra anonymised id (§10)
  shortLived: boolean;            // True for anonymous / incognito sessions (§9)
  startedAt: Date;
}

// ---------- Utility helpers (pseudo-only) ----------

export function createEntity(initialState: unknown): SnapshotRow { /* ... */ }
export function updateEntity(entityId: UUID, patch: unknown): SnapshotRow { /* ... */ }
export function resolveConflict(/* ... */): SnapshotRow { /* ... */ }
```

> NOTE  These shapes purposefully model *rows* rather than fully-hydrated objects so that they map 1-to-1 onto the append-only storage and transport behaviour described in the specification.
