# ApologyEscrow — On-Chain Honor & Conflict Resolution on GenLayer

**ApologyEscrow** is a decentralized, intelligent escrow application designed to facilitate accountability and restorative justice. By locking a penalty deposit, an offending party commits to publish a sincere, specific public apology or retraction. The contract uses GenLayer's multi-model LLM consensus to evaluate the submission against agreed-upon quality standards and resolve the deposit automatically.

---

## The Problem & The Solution

### Why Solidity and EVM Cannot Do This
In traditional blockchain environments like Ethereum/Solidity:
1. **No Qualitative Judgments**: Smart contracts cannot read free-form text and make subjective judgments like "Is this apology sincere?" or "Does it shift blame?".
2. **Oracle Limitations**: While oracles (like Chainlink) can fetch data, they are designed for deterministic APIs (such as price feeds). They cannot parse a dynamic, ever-changing webpage and verify if a retraction has been published in a prominent location without custom, centralized backends.
3. **Fragile Comparisons**: Even if an oracle fetched the web content, validators must execute identical code. Because LLM models are non-deterministic, running them directly breaks typical blockchain state replication.

### How GenLayer Solves This
GenLayer introduces **Intelligent Contracts** running on the GenVM, which supports non-deterministic operations using the **Equivalence Principle**:
1. **Web Rendering (`gl.nondet.web.render`)**: The contract directly fetches and renders the webpage (with full JS execution support) where the apology is supposed to live, proving the public nature of the apology.
2. **LLM Consensus (`gl.nondet.exec_prompt`)**: It runs multi-model LLM evaluations to judge the apology against a formal qualitative rubric.
3. **Consensus Bucketing (`gl.vm.run_nondet_unsafe`)**: The Leader and Validator nodes independently execute LLM prompts. By agreeing on the final verdict bucket (`QUALIFIES` or `FAILS`) rather than exact scores or feedback strings, the network achieves consensus on qualitative outcomes.

---

## Real-World Use Cases

1. **Press and Media Retractions**:
   A news outlet accused of publishing libel locks a deposit. They must publish a correction. The contract reads their site; if the correction is deemed adequate and prominent, the deposit is refunded. If not, it goes to the victim.
2. **Public-Figure/Brand PR Commitments**:
   An influencer or corporation accused of offensive behavior locks a penalty deposit. The funds are returned only if they issue a genuine, specific apology that takes full responsibility and avoids victim-blaming.
3. **DAO and Community Dispute Resolution**:
   Disagreements in a community can be settled via restorative covenants where the offender commits to a public retraction or apology in community forums, evaluated objectively by the protocol.

---

## Contract Architecture & Rubric Design

### Storage Variables
- `grievance`: The details of what occurred.
- `standard`: The qualitative requirements agreed upon.
- `deposit`: The locked GEN amount.
- `status`: Tracks the state (`OPEN` -> `SUBMITTED` -> `FAILED` / `QUALIFIED` -> `RESOLVED`).
- `attempts`: Counts evaluation attempts (max 3).
- `pass_threshold`: The minimum score (e.g. 70) to qualify.

### Sincerity & Deflection Rubric
The LLM evaluates 5 dimensions:
- **Responsibility**: First-person ownership, no passive voice ("mistakes were made").
- **Specificity**: References the exact grievance.
- **Sincerity**: Sincere and professional tone.
- **Remedy/Correction**: Concrete steps to make amends.
- **No Deflection**: **Gating dimension**. If the text contains deflective remarks (e.g. "sorry if you were offended", "but they started it"), it receives a failing score for this dimension, causing the overall verdict to fail regardless of other scores.
