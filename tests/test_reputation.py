import pytest
import json
from genlayer import Address

def setup_submitted_case(contract, setup_gl_state):
    setup_gl_state.message.sender_address = Address("0x1111111111111111111111111111111111111111")
    setup_gl_state.message.value = 10 * 10**18
    deadline = 1770337073 + 86400 * 3
    case_id = contract.open_case(
        wronged_addr="0x2222222222222222222222222222222222222222",
        charity_addr="0x3333333333333333333333333333333333333333",
        grievance="Grievance",
        standard="Standard",
        pass_threshold=70,
        deadline=deadline
    )
    contract.submit_apology(case_id, "I apologize", "https://twitter.com/apology")
    return case_id

def test_reputation_default(contract, setup_gl_state):
    """Verifies default reputation is 0."""
    offender = "0x1111111111111111111111111111111111111111"
    assert contract.get_reputation(offender) == 0

def test_reputation_failed_evaluation(contract, setup_gl_state):
    """Verifies reputation decreases by 1 on failed evaluation attempt."""
    case_id = setup_submitted_case(contract, setup_gl_state)
    offender = contract.offender.get(case_id)
    
    llm_output = {"score": 40, "no_deflection": 50, "verdict": "FAILS"}
    setup_gl_state.nondet.exec_prompt = lambda prompt, response_format=None: json.dumps(llm_output)
    
    contract.evaluate_apology(case_id)
    assert contract.get_reputation(offender.as_hex) == -1

def test_reputation_qualified_and_resolved(contract, setup_gl_state):
    """Verifies reputation increases by 1 only after dispute window passes without disputes."""
    case_id = setup_submitted_case(contract, setup_gl_state)
    offender = contract.offender.get(case_id)
    
    llm_output = {"score": 85, "no_deflection": 85, "verdict": "QUALIFIES"}
    setup_gl_state.nondet.exec_prompt = lambda prompt, response_format=None: json.dumps(llm_output)
    
    contract.evaluate_apology(case_id)
    
    # Still QUALIFIED, not RESOLVED. Reputation should still be 0.
    assert contract.get_reputation(offender.as_hex) == 0
    
    # Shift time past dispute deadline
    setup_gl_state.message_raw["datetime"] = "2026-06-21T21:37:53Z"
    setup_gl_state.message.sender_address = offender
    contract.claim_on_deadline(case_id)
    
    # Now RESOLVED, reputation +1
    assert contract.get_reputation(offender.as_hex) == 1

def test_reputation_dispute_uphold(contract, setup_gl_state):
    """Verifies reputation increases by 1 when dispute is upheld (apology qualified)."""
    case_id = setup_submitted_case(contract, setup_gl_state)
    offender = contract.offender.get(case_id)
    
    # Qualifies
    llm_output = {"score": 85, "no_deflection": 85, "verdict": "QUALIFIES"}
    setup_gl_state.nondet.exec_prompt = lambda prompt, response_format=None: json.dumps(llm_output)
    contract.evaluate_apology(case_id)
    
    # Dispute
    setup_gl_state.message.sender_address = contract.wronged.get(case_id)
    setup_gl_state.message.value = 5 * 10**18
    contract.dispute_qualification(case_id, "Dispute")
    
    # Evaluate dispute -> Uphold
    setup_gl_state.nondet.exec_prompt = lambda prompt, response_format=None: json.dumps(llm_output)
    setup_gl_state.message.sender_address = contract.admin
    contract.evaluate_apology(case_id)
    
    assert contract.get_reputation(offender.as_hex) == 1

def test_reputation_dispute_overturn(contract, setup_gl_state):
    """Verifies reputation decreases by 3 when dispute is overturned (fails evaluation)."""
    case_id = setup_submitted_case(contract, setup_gl_state)
    offender = contract.offender.get(case_id)
    
    # Qualifies
    llm_output = {"score": 85, "no_deflection": 85, "verdict": "QUALIFIES"}
    setup_gl_state.nondet.exec_prompt = lambda prompt, response_format=None: json.dumps(llm_output)
    contract.evaluate_apology(case_id)
    
    # Dispute
    setup_gl_state.message.sender_address = contract.wronged.get(case_id)
    setup_gl_state.message.value = 5 * 10**18
    contract.dispute_qualification(case_id, "Dispute")
    
    # Evaluate dispute -> Overturn
    llm_output_fails = {"score": 50, "no_deflection": 40, "verdict": "FAILS"}
    setup_gl_state.nondet.exec_prompt = lambda prompt, response_format=None: json.dumps(llm_output_fails)
    setup_gl_state.message.sender_address = contract.admin
    contract.evaluate_apology(case_id)
    
    assert contract.get_reputation(offender.as_hex) == -3

def test_reputation_invalid_address(contract, setup_gl_state):
    """Verifies that reputation checks with invalid addresses are rejected."""
    with pytest.raises(Exception, match="Invalid address"):
        contract.get_reputation("invalid-address")
