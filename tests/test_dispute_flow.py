import pytest
import json
from genlayer import Address

def setup_qualified_case(contract, setup_gl_state):
    setup_gl_state.message.sender_address = Address("0x1111111111111111111111111111111111111111")
    setup_gl_state.message.value = 10 * 10**18  # 10 GEN
    deadline = 1770337073 + 86400 * 3
    case_id = contract.open_case(
        wronged_addr="0x2222222222222222222222222222222222222222",
        charity_addr="0x3333333333333333333333333333333333333333",
        grievance="PR Scandal",
        standard="Retraction",
        pass_threshold=70,
        deadline=deadline
    )
    contract.submit_apology(case_id, "I apologize", "https://twitter.com/apology")
    
    # Mock successful evaluation
    llm_output = {"score": 85, "no_deflection": 80, "verdict": "QUALIFIES"}
    setup_gl_state.nondet.exec_prompt = lambda prompt, response_format=None: json.dumps(llm_output)
    contract.evaluate_apology(case_id)
    return case_id

def test_dispute_qualification_success(contract, setup_gl_state):
    """Verifies that wronged party can dispute qualified case with sufficient stake."""
    case_id = setup_qualified_case(contract, setup_gl_state)
    
    # Wronged party calls dispute
    setup_gl_state.message.sender_address = Address("0x2222222222222222222222222222222222222222")
    setup_gl_state.message.value = 5 * 10**18 # 50% of 10 GEN deposit
    
    contract.dispute_qualification(case_id, "This retraction was posted on an empty account")
    
    assert contract.status.get(case_id) == "DISPUTED"
    assert contract.dispute_reason.get(case_id) == "This retraction was posted on an empty account"
    assert contract.dispute_stake.get(case_id) == 5 * 10**18

def test_dispute_qualification_insufficient_stake(contract, setup_gl_state):
    """Verifies that dispute is rejected if stake is less than 50% of deposit."""
    case_id = setup_qualified_case(contract, setup_gl_state)
    
    setup_gl_state.message.sender_address = Address("0x2222222222222222222222222222222222222222")
    setup_gl_state.message.value = 4 * 10**18 # Insufficient (need 5 GEN)
    
    with pytest.raises(Exception, match="Insufficient stake"):
        contract.dispute_qualification(case_id, "Dispute reason")

def test_dispute_qualification_wrong_caller(contract, setup_gl_state):
    """Verifies that only the wronged party can initiate a dispute."""
    case_id = setup_qualified_case(contract, setup_gl_state)
    
    # Random person calls dispute
    setup_gl_state.message.sender_address = Address("0x4444444444444444444444444444444444444444")
    setup_gl_state.message.value = 5 * 10**18
    
    with pytest.raises(Exception, match="Only the wronged party can dispute the case"):
        contract.dispute_qualification(case_id, "Dispute reason")

def test_dispute_qualification_expired(contract, setup_gl_state):
    """Verifies that dispute cannot be called after the 3 days window."""
    case_id = setup_qualified_case(contract, setup_gl_state)
    
    # Shift time forward by 4 days
    setup_gl_state.message_raw["datetime"] = "2026-06-21T21:37:53Z"
    
    setup_gl_state.message.sender_address = Address("0x2222222222222222222222222222222222222222")
    setup_gl_state.message.value = 5 * 10**18
    
    with pytest.raises(Exception, match="Dispute deadline has already passed"):
        contract.dispute_qualification(case_id, "Dispute reason")

def test_evaluate_dispute_uphold(contract, setup_gl_state):
    """Verifies dispute resolution when AI upholds the apology quality."""
    case_id = setup_qualified_case(contract, setup_gl_state)
    
    # Dispute
    setup_gl_state.message.sender_address = Address("0x2222222222222222222222222222222222222222")
    setup_gl_state.message.value = 5 * 10**18
    contract.dispute_qualification(case_id, "Reason")
    
    # Set separate admin to avoid balance collision with offender
    contract.admin = Address("0x9999999999999999999999999999999999999999")
    
    # Mock LLM to UPHOLD (QUALIFIES)
    llm_output = {"score": 80, "no_deflection": 80, "verdict": "QUALIFIES"}
    setup_gl_state.nondet.exec_prompt = lambda prompt, response_format=None: json.dumps(llm_output)
    
    # Admin calls evaluate
    setup_gl_state.message.sender_address = Address("0x9999999999999999999999999999999999999999")
    contract.evaluate_apology(case_id)
    
    offender = contract.offender.get(case_id)
    assert contract.status.get(case_id) == "RESOLVED"
    # Offender gets deposit (10 GEN) credited to withdrawable balance
    assert contract.withdrawable_balance.get(offender) == 10 * 10**18
    # Admin gets the staked amount (5 GEN) as penalty reward
    assert contract.withdrawable_balance.get(contract.admin) == 5 * 10**18
    # Offender reputation +1
    assert contract.offender_reputation.get(offender) == 1

def test_evaluate_dispute_overturn(contract, setup_gl_state):
    """Verifies dispute resolution when AI overturns (fails) the apology quality."""
    case_id = setup_qualified_case(contract, setup_gl_state)
    
    # Dispute
    setup_gl_state.message.sender_address = Address("0x2222222222222222222222222222222222222222")
    setup_gl_state.message.value = 5 * 10**18
    contract.dispute_qualification(case_id, "Reason")
    
    # Mock LLM to OVERTURN (FAILS)
    llm_output = {"score": 50, "no_deflection": 40, "verdict": "FAILS"}
    setup_gl_state.nondet.exec_prompt = lambda prompt, response_format=None: json.dumps(llm_output)
    
    # Admin calls evaluate
    setup_gl_state.message.sender_address = contract.admin
    contract.evaluate_apology(case_id)
    
    offender = contract.offender.get(case_id)
    wronged = contract.wronged.get(case_id)
    
    assert contract.status.get(case_id) == "RESOLVED"
    # Offender gets 0
    assert contract.withdrawable_balance.get(offender, 0) == 0
    # Wronged gets stake (5 GEN) + 100% of offender deposit (10 GEN) credited (since wronged != zero)
    # Total credited: 15 GEN
    assert contract.withdrawable_balance.get(wronged) == 15 * 10**18
    # Offender reputation -3
    assert contract.offender_reputation.get(offender) == -3
