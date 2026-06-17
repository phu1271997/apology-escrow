# Manual Test Scenarios — ApologyEscrow

Use these three scenarios to test the `ApologyEscrow` contract functionality in GenLayer Studio. 

*Note: Ensure all addresses are formatted as valid Address hex strings required by your local environment, e.g., `0x1111111111111111111111111111111111111111`.*

---

## Setup / Common Test Addresses
- **Wronged Party (`wronged_addr`)**: `0x1111111111111111111111111111111111111111`
- **Charity (`charity_addr`)**: `0x2222222222222222222222222222222222222222`
- **Future Deadline (`deadline`)**: `2000000000` (Epoch timestamp)

---

## Scenario A: Genuine, Specific Apology (QUALIFIES)
This scenario demonstrates a successful reconciliation where the offender provides a sincere apology and recovers their deposit.

### Step 1: Open Case
- **Method**: `open_case`
- **Payable Value**: `1000000000000000000` (1 GEN in wei)
- **Inputs**:
  - `wronged_addr`: `0x1111111111111111111111111111111111111111`
  - `charity_addr`: `0x2222222222222222222222222222222222222222`
  - `grievance`: `"The offender publicly accused the wronged party of embezzling DAO treasury funds without evidence."`
  - `standard`: `"A public apology retracting the accusation, acknowledging it was baseless, and apologizing to the wronged party by name."`
  - `pass_threshold`: `70`
  - `deadline`: `2000000000`
- **Expected Return**: `"case_0"`

### Step 2: Submit Apology
- **Method**: `submit_apology`
- **Inputs**:
  - `case_id`: `"case_0"`
  - `apology_text`: `"I retract my statement regarding the wronged party embezzling DAO treasury funds. I acknowledge that this accusation was completely baseless and apologize to them by name for the harm caused. I take full responsibility for spreading misinformation."`
  - `apology_url`: `""`

### Step 3: Evaluate Apology
- **Method**: `evaluate_apology`
- **Inputs**:
  - `case_id`: `"case_0"`
- **Expected Verdict**: `"QUALIFIES"`
- **Result**: The locked 1 GEN deposit is refunded to the offender's address; the case status changes to `"RESOLVED"`.

---

## Scenario B: "Sorry if you were offended" Non-Apology (FAILS on Deflection Gate)
This scenario demonstrates how the deflection gating criteria prevents insincere apologies from qualifying, even if other scores are moderate.

### Step 1: Open Case
- **Method**: `open_case`
- **Payable Value**: `1000000000000000000` (1 GEN in wei)
- **Inputs**:
  - `wronged_addr`: `0x1111111111111111111111111111111111111111`
  - `charity_addr`: `0x2222222222222222222222222222222222222222`
  - `grievance`: `"The offender made disparaging remarks about the wronged party's programming skills during a team call."`
  - `standard`: `"A sincere apology taking full responsibility for the remarks, acknowledging the harm to their professional reputation, and committing to professional behavior."`
  - `pass_threshold`: `70`
  - `deadline`: `2000000000`
- **Expected Return**: `"case_1"`

### Step 2: Submit Apology
- **Method**: `submit_apology`
- **Inputs**:
  - `case_id`: `"case_1"`
  - `apology_text`: `"I am sorry if you were offended by what I said on the team call. Mistakes were made, but you have to admit the project timeline was slipping and pressure was high. I hope we can move past this."`
  - `apology_url`: `""`

### Step 3: Evaluate Apology
- **Method**: `evaluate_apology`
- **Inputs**:
  - `case_id`: `"case_1"`
- **Expected Verdict**: `"FAILS"`
- **Result**: The status is updated to `"FAILED"`. The offender has attempts remaining to submit a proper, non-deflective apology.

---

## Scenario C: Multi-Attempt Feedback Loop (FAIL followed by PASS)
This scenario showcases the feedback loop, where the offender first fails, receives AI feedback, and resubmits an improved apology to resolve the case.

### Step 1: Open Case
- **Method**: `open_case`
- **Payable Value**: `1000000000000000000` (1 GEN in wei)
- **Inputs**:
  - `wronged_addr`: `0x1111111111111111111111111111111111111111`
  - `charity_addr`: `0x2222222222222222222222222222222222222222`
  - `grievance`: `"The offender failed to deliver the audit report on time, causing a delay in the protocol launch."`
  - `standard`: `"A sincere apology explaining the delay, taking responsibility, and offering a discount or concrete compensation."`
  - `pass_threshold`: `70`
  - `deadline`: `2000000000`
- **Expected Return**: `"case_2"`

### Step 2: Submit First Apology
- **Method**: `submit_apology`
- **Inputs**:
  - `case_id`: `"case_2"`
  - `apology_text`: `"I am sorry the audit report was late. The protocol launch was delayed. We did our best but had resource issues."`
  - `apology_url`: `""`

### Step 3: First Evaluation
- **Method**: `evaluate_apology`
- **Inputs**:
  - `case_id`: `"case_2"`
- **Expected Verdict**: `"FAILS"` (Status changes to `"FAILED"`)

### Step 4: Check Feedback
- **Method**: `get_feedback`
- **Inputs**:
  - `case_id`: `"case_2"`
- **Expected Output**: Feedback JSON indicating that the apology lacked a concrete remedy/compensation and did not clearly take responsibility (shifted blame to "resource issues").

### Step 5: Submit Improved Apology
- **Method**: `submit_apology`
- **Inputs**:
  - `case_id`: `"case_2"`
  - `apology_text`: `"I apologize for delivering the audit report late and delaying the protocol launch. I take full responsibility for this oversight. To make amends, we are refunding 20% of the audit fee and prioritizing your future reviews."`
  - `apology_url`: `""`

### Step 6: Second Evaluation
- **Method**: `evaluate_apology`
- **Inputs**:
  - `case_id`: `"case_2"`
- **Expected Verdict**: `"QUALIFIES"`
- **Result**: The status is updated to `"RESOLVED"`, and the deposit is refunded.
