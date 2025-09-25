# Review

## Quick start

### SDK

| Area | Python | TypeScript | Fix proposal |
| --- | --- | --- | --- |
| Client creation API | `GolemBaseClient.create_rw_client(...)` | `createClient(...)` | Standardize name across both |
| Chain selection | No `CHAIN_ID` param | Requires/passes `chainId` | Require in Python too, or make optional in TS. |
| Key format | Raw bytes from hex | `new Tagged("privatekey", Buffer...)` | Accept plain bytes/hex in both; handle tagging internally or expose same helper. |
| Address getter | `get_account_address()` | `getOwnerAddress()` | Align nouns → `getAccountAddress()` / `get_account_address()`. |
| Balance access | `client.http_client().eth.get_balance(...)` | Not exposed | Add high-level `get_balance()` to both SDKs. |

### Guide

| Area | Python guide | TypeScript guide | Fix proposal |
| --- | --- | --- | --- |
| Error handling | Wraps connect in `try/except` | No error handling | Either add `try/catch` in TS or remove in Python for symmetry. |
| Env defaults | Dummy fallback `PRIVATE_KEY` | Requires real `PRIVATE_KEY` | Remove dummy from Python; require real key in both. |
| Balance step | Prints balance and warns if 0 | No balance check | Either show same helper in both or omit from both. |
| Unused imports | — | `Annotation`, `randomUUID`, `TextEncoder`, `TextDecoder` unused | Clean TS snippet. |

## **Create Your First Entity**

### SDK

| Area | Python | TypeScript | Short fix proposal |
| --- | --- | --- | --- |
| Return shape from create | `receipts = await client.create_entities([entity])` → list; takes first item | `const createReceipt = await client.createEntities(creates)` → implied single object | Standardize: both return a **list** (even for 1 item), and show indexing in both docs. |
| Required annotations API | Same `Annotation(key, value)` class used for string & numeric lists | Same, but lists typed as `stringAnnotations`/`numericAnnotations` | Keep identical list names across SDKs (string/numeric) and identical `Annotation` ctor in both. |

### Guide

| Area | Python guide | TypeScript guide | Short fix proposal |
| --- | --- | --- | --- |
| BTL value & timing note | `btl=100` (no timing hint) | `btl: 300  // ~10 minutes (2s blocks)` | Use the **same BTL** and the **same timing comment** in both (pick one: 100 or 300). |
| Showing `id` | Not included | Adds `id` via `randomUUID()` | Add an `id` annotation in Python (e.g., `uuid4()`), or remove from TS. |
| Field explainer block | None | Comment block listing the 4 fields | Add the same 4-field comment to Python (or create a shared callout in both guides). |
| Receipt logging | Prints key + expiration block; returns key | Logs whole receipt object | Show the **same two lines** in both: print entity key and expiration block. |
| Function wrapper | Wrapped in `async def create_first_entity(client)` | Inline top-level snippet | Pick one style for both (inline or helper function); inline is simpler for “getting started”. |
| Tips and notes | Faucet & Block explorer links not present; Explanation of BTL present | Faucet & Block explorer links not present present in annotation; lack of BTL note | Keep tips and notes consistent between guides |

## **Query Your Data**

### SDK

| Area | Python | TypeScript | Short fix proposal |
| --- | --- | --- | --- |
| Metadata method spelling | `get_entity_metadata(...)` | `getEntityMetaData(...)` (capital **D**) | Standardize to **Metadata** (no internal capital): `get_entity_metadata` / `getEntityMetadata`. |

### Guide

| Area | Python guide | TypeScript guide | Short fix proposal |
| --- | --- | --- | --- |
| Equality examples (numbers) | `version=1`, `priority=5` | — | Add a numeric equality example in TS (e.g., `version = 1`). |
| Range examples | `score>=80` | `score >= 80 && score <= 100` | Use the same range example in both (recommend two-sided range). |
| Complex boolean examples | `(type = "greeting" && version > 2) || status = "urgent"` | `(type = "task" && priority > 3) || status = "urgent"` | Use the same complex example in both (pick one). |
| String equality demo | `type="greeting"`, `type="message"` | `type = "greeting"`, `type = "message" || type = "other"` | Align values (e.g., both use `greeting`/`message`). |
| Owner-scoped query | `$owner="..."` via `client.get_account_address()` | — | Add owner query example to TS. |
| Result processing approach | Tries JSON parse, falls back to string | Always decodes to string | Pick one approach (simplest: string decode only). |
| Helper for printing results | Inline `for` loop | Uses `printEntities(...)` helper | Choose one style (inline is simpler for quickstart). |
| Metadata/storage labels | “Entity metadata”, “Entity storage” | “Meta data”, “Storage value” | Standardize labels (e.g., “Entity metadata”, “Storage value”). |

## **Event Monitoring**

### SDK

| Area | Python | TypeScript | Short fix proposal |
| --- | --- | --- | --- |
| Watch method name | `watch_logs(...)` (awaited) | `watchLogs({...})` (not awaited) | Align behavior: either both return synchronously, or both are `await`-able. Provide aliasing (`watchLogs`/`watch_logs`) if needed. |
| Start block control | No start block parameter | `fromBlock: BigInt(0)` supported | Add a `from_block` (or equivalent) option in Python; document default in both. |
| Label filter | `label=""` supported | No label option | Either add `label` in TS or remove from Python if not supported by backend. |
| Error callback | Not present | `onError(error)` supported | Add error callback support in Python. |

### Guide

| Area | Python guide | TypeScript guide | Short fix proposal |
| --- | --- | --- | --- |
| Error handling example | None | Logs `onError` | Add the same error handler example to Python docs. |
| From-block example | None | Shows `fromBlock: BigInt(0)` | Add a from-block example (or note default behavior) to Python docs. |
| Label usage | Demonstrates `label=""` | No mention | Either document label in TS or remove from Python guide if not supported. |
| Log message text | “Entity created: {key}” etc. | Similar, plus “Watch error” | Unify log strings across both snippets for consistency. |

## **Batch Processing**

### Guide

| Area | Python guide | TypeScript guide | Short fix proposal |
| --- | --- | --- | --- |
| Query filter example | `type="batch" && batch_id="<id>"` | `batchId = "<id>"` (no `type` clause) | Use the same filter in both (recommend `type = "batch" && batchId = "<id>"`). |
| Numeric annotation example | Adds `numeric_annotations: [Annotation("sequence", i+1)]` with note | Omits numeric annotations | Either add the same `sequence` example to TS or remove from both to keep focus on batching. |

## **Managing Data Lifetime**

### SDK

| Area | Python | TypeScript | Short fix proposal |
| --- | --- | --- | --- |
| Receipt field names (extend) | `ext_receipt.old_expiration_block`, `new_expiration_block` | `extendReceipts[0].newExpirationBlock` (no “old” shown) | Ensure both SDKs expose `old` and `new` expiration; document both. |
| Metadata getter name | `get_entity_metadata(...)` | `getEntityMetaData(...)` (capital **D**) | Standardize to `getEntityMetadata`/`get_entity_metadata`. |

### Guide

| Area | Python guide | TypeScript guide | Short fix proposal |
| --- | --- | --- | --- |
| BTL timing comment | “Expires after 50 blocks” (no seconds) | “50 blocks * 2 seconds = 100 seconds” | Use the same timing hint in both (or omit seconds in both). |
| Extend amount | `number_of_blocks=200` | `numberOfBlocks: 150` | Use the same example value in both (pick 150 or 200). |
| Logging extend outcome | Prints `old` → `new` range | Prints only `new` | Show both old and new in both guides. |
| Metadata call name in text | “Get entity metadata” | “getEntityMetaData” shown in code | Normalize wording and method spelling across both. |

### Overall improvement ideas

few brackets feel connected → like you can paste one after another but then there’re those with different functions

Node/Yarn alongside Bun

### Naming inconsistency

| Where | Exact text (as in page) | What’s inconsistent | Quick fix |
| --- | --- | --- | --- |
| Section heading (Install) | “Set up a new TypeScript project with **Bun and Golem DB SDK**” | You call the package “Golem **DB** SDK”, but the actual package name is **`golem-base-sdk`** (Base). | “Set up a new TypeScript project with the **Golem DB TypeScript SDK (`golem-base-sdk`)**”. |
| Install command | `bun add **golem-base-sdk** crypto dotenv tslib` | Command shows **Base** (correct for the package), but conflicts with the “Golem **DB** SDK” wording above. | Keep the command; align the wording above as suggested. Also drop `crypto` from deps (Node/Bun provide it). |
| Code comment (Connect) | `// Create a client to interact with the **GolemDB** API` | Uses **GolemDB** (no space) instead of **Golem DB**. | “Golem **DB** API”. |
| Console log (Connect) | `Connected to **Golem DB** on ETHWarsaw testnet!` | Uses **Golem DB** (fine), but later meta shows the SDK/package as **Golem Base**. Readers don’t see how DB relates to Base. | Keep this, but add a one-liner up top: “**Golem Base** is the network; **Golem DB** is the data layer & TypeScript SDK (`golem-base-sdk`).” |
| Explorer mention | “check your entity on the **Golem DB Block Explorer**” | DB vs Base isn’t explained; explorer likely serves the **Golem Base** network for **Golem DB** entities. | Keep label, but add the same relationship note (Base = network, DB = data/SDK). |
| Logger name (Full Example) | `name: "**GolemDB** Example"` | Again **GolemDB** (no space). | `name: "Golem **DB** Example"`. |
| SDK version box | “Package: **golem-base-sdk**” | Uses **Base** (package), while most prose says **Golem DB**. Not an error, but readers need the mapping. | Add a small alias line: “**Golem DB TypeScript SDK** — npm package: `golem-base-sdk`”. |
| Page title vs package | Title: “Getting Started with **Golem DB**” + later “View on **NPM**” | Title says **DB**; link likely lands on **`golem-base-sdk`** (Base). | Update link text to “View **Golem DB TS SDK (`golem-base-sdk`)** on npm”. |