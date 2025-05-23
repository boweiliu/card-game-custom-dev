---
trigger: always_on
---

- don't use sqlite npm package, only use sqlite3 and its API.
- Never hardcode the PORT in the code. Always use environment variables or configuration files to specify the PORT dynamically.
- Use "import * as styles" instead of "import styles"