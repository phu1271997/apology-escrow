import pytest
import json
from genlayer import Address

def setup_submitted_case(contract, setup_gl_state, threshold=70):
    setup_gl_state.message.sender_address = Address("0x1111111111111111111111111111111111111111")
    setup_gl_state.message.value = 10 * 10**18
    deadline = 1770337073 + 86400 * 3
    case_id = contract.open_case(
        wronged_addr="0x2222222222222222222222222222222222222222",
        charity_addr="0x3333333333333333333333333333333333333333",
        grievance="PR Scandal",
        standard="Retraction",
        pass_threshold=threshold,
        deadline=deadline
    )
    contract.submit_apology(case_id, "I apologize sincerely", "https://twitter.com/apology")
    return case_id

def test_evaluate_success_qualifies(contract, setup_gl_state):
    """Verifies that an apology meeting the threshold qualifies the case."""
    case_id = setup_submitted_case(contract, setup_gl_state, threshold=70)
    
    # Mock LLM to return high scores
    llm_output = {
        "responsibility": 80,
        "specificity": 75,
        "sincerity": 85,
        "remedy_or_correction": 70,
        "no_deflection": 90,
        "score": 80,
        "verdict": "QUALIFIES",
        "missing_elements": "None",
        "reasoning": "Genuine apology"
    }
    setup_gl_state.nondet.exec_prompt = lambda prompt, response_format=None: json.dumps(llm_output)
    
    verdict = contract.evaluate_apology(case_id)
    
    assert verdict == "QUALIFIES"
    assert contract.status.get(case_id) == "QUALIFIED"
    assert contract.attempts.get(case_id) == 1
    assert contract.last_score.get(case_id) == 80
    assert contract.dispute_deadline.get(case_id) > 0

def test_evaluate_fails_reap_remaining(contract, setup_gl_state):
    """Verifies that failing to meet the threshold changes status to FAILED if attempts remain."""
    case_id = setup_submitted_case(contract, setup_gl_state, threshold=70)
    
    llm_output = {
        "responsibility": 40,
        "specificity": 45,
        "sincerity": 50,
        "remedy_or_correction": 30,
        "no_deflection": 55, # < 60 gating
        "score": 45,
        "verdict": "FAILS",
        "missing_elements": "Deflection detected",
        "reasoning": "Blamed the victim"
    }
    setup_gl_state.nondet.exec_prompt = lambda prompt, response_format=None: json.dumps(llm_output)
    
    verdict = contract.evaluate_apology(case_id)
    
    assert verdict == "FAILS"
    assert contract.status.get(case_id) == "FAILED"
    assert contract.attempts.get(case_id) == 1
    
    # Offender reputation should decrease by 1
    offender = contract.offender.get(case_id)
    assert contract.offender_reputation.get(offender) == -1

def test_evaluate_final_fails_payout(contract, setup_gl_state):
    """Verifies that reaching max attempts triggers final failure and credits recipient."""
    case_id = setup_submitted_case(contract, setup_gl_state, threshold=70)
    
    # Set attempts to 2 (so next attempt is 3rd, which is max)
    contract.attempts[case_id] = 2
    
    llm_output = {"score": 40, "no_deflection": 50, "verdict": "FAILS"}
    setup_gl_state.nondet.exec_prompt = lambda prompt, response_format=None: json.dumps(llm_output)
    
    contract.evaluate_apology(case_id)
    
    assert contract.status.get(case_id) == "RESOLVED"
    assert contract.deposit.get(case_id) == 0
    
    # Wronged party should be credited
    wronged = contract.wronged.get(case_id)
    assert contract.withdrawable_balance.get(wronged) == 10 * 10**18

def test_evaluate_inconclusive_fallback(contract, setup_gl_state):
    """Verifies that a web rendering error marks status as INCONCLUSIVE and keeps state SUBMITTED."""
    case_id = setup_submitted_case(contract, setup_gl_state, threshold=70)
    
    # Force web.render to raise exception
    def broken_render(url, mode=None):
        raise Exception("Network timeout")
    setup_gl_state.nondet.web.render = broken_render
    
    verdict = contract.evaluate_apology(case_id)
    
    assert verdict == "INCONCLUSIVE"
    assert contract.status.get(case_id) == "SUBMITTED"
    assert contract.attempts.get(case_id) == 1  # Incremented but kept active
    
    feedback = json.loads(contract.last_feedback.get(case_id))
    assert feedback.get("error") == "INCONCLUSIVE"
