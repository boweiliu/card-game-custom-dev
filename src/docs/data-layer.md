SPECS

1. Data append only ; internal representation is mostly append only (some ids, metadata etc. might be updated inplace)
2. Messages should be idempotent and reorderable
2. synchronous local CRURM interface - create, read, update, resolve conflicts, migrate schema. Machinery happens async behind the hood. Can query synced state etc.
3. Enttity schema supports versioning, migrating, and backporting, per-entity
4. Messages can have atomic composite payloads
5. Each row has an author and a reviewer
6. Agnostic to server -- server is just a convenient name for the canonical reviewer
7. All merge conficts / race conditions happen in application layer
8. id == uuid; orderKey is for autoincrementing; timestamp for logs; whoami id 
9. Client sessions may be shortlived for anonymity; base it off the whoamiId
10. Low mutual client trust -- store an internal personal id as well
11. store "parentCanonicalIds" for tracking merge necessity
12. Use checksums, diffs, whatever at the transport layer as needed
13. The connection of the server to its database is not in scope -- server can simply not ack the message if its database connection is bad.
14. How do clients query "indexes - getAll()" type stuff? How do clients deal with data loss?
15. Support peer to peer connections at the transport layer too
16. How does reviewer selection aka leader election work?
17. archival/data loss recovery/compaction is the same problem as client onboarding/"i dont know what this id refers to"
18. Transport layer is based on sync -> ack/nack/clarify handshakes. Bidir protocal, can be run over channels which are fire-forget, or request-response, or full bidir.
19. The nature of computed data... that should be an application concern. If it's truly computed, don't store it ; if it does need to be cached, then its not computed and something should manage that
20. WHAT IF : we stored the "linear" history as a separate thing from all the snapshots? again, separate the concerns, cuz merges are a completely separate entity usually (they require different UX, etc.). This would make linear history single-write which is nice.
    ANS: NO WAY!! linear history is a lie in a p2p context (split brain can happen at any time). Instead we should do explicit A, B -> (AB) merge pairs. Record coordinated acks somehow.
21. Make the schema versioning also store a human-readable data dictionary description; this helps with semantic changes where the shape is the same but the meaning is different
22. For the love of god let's make sure to version the transport protocal and really this whole data layer so we can make changes later if needed.
23. User-facing merge conflict flows are not in scope. data layer just handles conflict bag-of-X style
24. the overall goal = make it easy to write frontend that is optimistic, local-first, p2p, and doesn't have to worry about maanging my own transactions/bugs caused by stale state/batching etc.
25. Other goals:
  a. Standardize sync vs async interface, and make it possible to prefer the sync one (separate those concerns)
  b. Similar interface on backend vs frontend, and the style that everyone understand (crud-like).
  c. All async data backends (file systems, database) should be treated to be as unreliable as a client. This might mean 2 backend clients: one which does biz logic and another which just persists to DB.
  d. you can just run multiple backends or multiple clients that talk to each other locally; very flexible on transport. Easy scaling of server AND databases.
26.  Other differences from automerge:
  a. state migration friendly.
  b. Standardish API interfaces at client/server as well as database and dom. This makes it easy to debug or introspect (curl + sql, unlike automerge)
  c. Untrusted write/verify can lead to anticheat stuff later.
  d. Opinionated ORM-like interface into both frontend and backend. (see b above)
  e. Language agnostic and automerge compatible. (The crdt is another pluggable component)
  f. Don't care about cross-local file system stuff which automerge has fancy handling for.
  g. Planning to handle broadcast style one-to-many transports too.
27. be more careful about archiving old states, especially try not to delete the hashes if possible.
28. Also: rely on the synchro log.
29. Linear history is a lie but each client has linear history, maybe track that and track when folks synced with each other; have a snapshot, then each client has 1 branch (per version) (or maybe a finite number of branches), then keep "i send this snapshot to this other client and he reviewed it" <- these are "syncrho logs".
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
  - How? We should definitely store the last synchro row. For B3 for instance, the last synchro row from A is A1 (created by A but NOT reviewed by B since it was in conflict at the time), and the last full synchro is 0, and the last attempted merge was B2. For the A3 message, they think the last synchro from usB was B1, and the last full synchro was 0, and the last attempted merge was A2. In other words, us accepting A3 is contingent on us accepting the merge A2, because A2 contains B1. OR - equivalently; A3 is a descendent of B1 but not anything else in our history, but we know B2 (and posssibly more stuff) came after B1, so we will try to merge in A3 and find the same merge conflict during B2 = 0 | B1 + A1, but now it looks like B9 = B1 | B8 + A3 . We know we sent B2 first and didn't get a response yet. but we can still send B9 (since it's tagged as a B8 + A3 merged) and maybe it's acceptable.
  - Of course this is all in the case where A and B are equal clients and neither wants to accept the other's merge resolutions. If it's a server vs client case (hopefully prenegotiated that one client has priority), then B's merge algorithm should be to accept merge resolutions from S over any local merges.





# Data Transfer Layers Documentation

This document outlines the data transfer layers within our project, spanning the frontend, backend, and database. It provides an overview of how data flows through the system and the key components involved.

## Data Flow Diagram

Below is an improved ASCII diagram representing the data flow pipeline:

```
Frontend Screen Components
+-------------------+
|                   |
|   CRUD Operations |
|                   |
+-------------------+
        |
        v
Frontend Data Repo Service
+-------------------+
|                   |
| Convert to        |

|                   |
+-------------------+
        |
        v
Messaging Service
+-------------------+
|                   |
| Enqueue & Track   |
| Sync/Ack States   |
|                   |
+-------------------+
        |
        v
API Layer
+-------------------+
|                   |
| Network Transfer  |
|                   |
+-------------------+
        |
        v
Backend API
+-------------------+
|                   |
| Passthrough       |
|                   |
+-------------------+
        |
        v
DB Persistence Layer
+-------------------+
|                   |
| Save to Database  |
|                   |
+-------------------+
        |
        v
Backend Acknowledgement
+-------------------+
|                   |
| Acknowledge       |
| Message           |
|                   |
+-------------------+

```

## Security Considerations

Discuss any security measures in place to protect data during transfer, such as encryption, authentication, and validation mechanisms.

## Future Improvements

Outline potential improvements or optimizations to enhance the efficiency and security of data transfers.
