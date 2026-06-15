import pytest
import json
from genlayer import Address

def setup_standard_case(contract, setup_gl_state):
    setup_gl_state.message.sender_address = Address("0x1111111111111111111111111111111111111111")
    setup_gl_state.message.value = 10 * 10**18
    deadline = 1770337073 + 86400 * 3
    case_id = contract.open_case(
        wronged_addr="0x2222222222222222222222222222222222222222",
        charity_addr="0x3333333333333333333333333333333333333333",
        grievance="PR Scandal",
        standard="Retraction",
        pass_threshold=70,
        deadline=deadline
    )
    return case_id

def test_claim_on_deadline_before_deadline(contract, setup_gl_state):
    """Verifies that calling claim_on_deadline before the deadline fails."""
    case_id = setup_standard_case(contract, setup_gl_state)
    
    with pytest.raises(Exception, match="Case deadline has not yet passed"):
        contract.claim_on_deadline(case_id)

def test_claim_on_deadline_active_case(contract, setup_gl_state):
    """Verifies that after deadline passes, anyone can resolve an active case to credit the wronged/charity."""
    case_id = setup_standard_case(contract, setup_gl_state)
    
    # Shift time past deadline (deadline was + 3 days)
    setup_gl_state.message_raw["datetime"] = "2026-06-21T21:37:53Z"
    
    # Random person calls claim_on_deadline
    setup_gl_state.message.sender_address = Address("0x9999999999999999999999999999999999999999")
    contract.claim_on_deadline(case_id)
    
    assert contract.status.get(case_id) == "RESOLVED"
    assert contract.deposit.get(case_id) == 0
    # Recipient wronged party credited
    wronged = contract.wronged.get(case_id)
    assert contract.withdrawable_balance.get(wronged) == 10 * 10**18
    # Offender reputation -1
    offender = contract.offender.get(case_id)
    assert contract.offender_reputation.get(offender) == -1

def test_claim_on_deadline_qualified_case_expired(contract, setup_gl_state):
    """Verifies that after dispute window passes, qualified case can be resolved to credit the offender."""
    case_id = setup_standard_case(contract, setup_gl_state)
    contract.submit_apology(case_id, "I apologize", "https://twitter.com/apology")
    
    # Mock qualifies evaluation
    llm_output = {"score": 80, "no_deflection": 80, "verdict": "QUALIFIES"}
    setup_gl_state.nondet.exec_prompt = lambda prompt, response_format=None: json.dumps(llm_output)
    contract.evaluate_apology(case_id)
    
    assert contract.status.get(case_id) == "QUALIFIED"
    
    # Shift time past dispute deadline (dispute deadline is +3 days from evaluation)
    setup_gl_state.message_raw["datetime"] = "2026-06-21T21:37:53Z"
    
    # Offender calls claim_on_deadline
    offender = contract.offender.get(case_id)
    setup_gl_state.message.sender_address = offender
    contract.claim_on_deadline(case_id)
    
    assert contract.status.get(case_id) == "RESOLVED"
    assert contract.deposit.get(case_id) == 0
    assert contract.withdrawable_balance.get(offender) == 10 * 10**18
    assert contract.offender_reputation.get(offender) == 1

def test_evaluate_max_attempts_reached(contract, setup_gl_state):
    """Verifies evaluating is rejected if attempts limit has already been met."""
    case_id = setup_standard_case(contract, setup_gl_state)
    contract.submit_apology(case_id, "I apologize", "")
    
    # Max attempts is 3. Set attempts to 3.
    contract.attempts[case_id] = 3
    contract.status[case_id] = "FAILED"
    
    with pytest.raises(Exception, match="Maximum evaluation attempts reached"):
        contract.submit_apology(case_id, "I apologize", "")

def test_malformed_llm_json_clean(contract, setup_gl_state):
    """Verifies clean_llm_json utility trims markdown blocks and removes trailing commas."""
    from contracts.apology_oracle import clean_llm_json
    
    raw_markdown_json = """
    ```json
    {
        "score": 80,
        "verdict": "QUALIFIES",
    }
    ```
    """
    cleaned = clean_llm_json(raw_markdown_json)
    # The markdown fences should be stripped, and the trailing comma after "QUALIFIES" removed.
    assert "```json" not in cleaned
    assert '"verdict": "QUALIFIES"}' in cleaned
