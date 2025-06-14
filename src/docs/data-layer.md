SPECS

1. Data append only
2. Messages should be idempotent and reorderable
2. CRURM interface - create, read, update, resolve conflicts, migrate schema
3. Enttity schema supports versioning, migrating, and backporting, per-entity
4. Messages can have atomic composite payloads
5. Each row has an author and a reviewer
6. Agnostic to server -- server is just a convenient name for the canonical reviewer
7. All merge conficts / race conditions happen in application layer
8. id == uuid; orderKey is for autoincrementing; timestamp for logs; whoami id 
9. Client sessions may be shortlived for anonymity; base it off the whoamiId
10. Low mutual client trust -- store an internal personal id as well



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
| Immutable Blobs   |
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
