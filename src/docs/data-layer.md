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
