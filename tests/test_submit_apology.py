import pytest
from genlayer import Address

def create_valid_case(contract, setup_gl_state):
    setup_gl_state.message.sender_address = Address("0x1111111111111111111111111111111111111111")
    setup_gl_state.message.value = 10**18
    deadline = 1770337073 + 86400 * 3
    return contract.open_case(
        wronged_addr="0x2222222222222222222222222222222222222222",
        charity_addr="0x3333333333333333333333333333333333333333",
        grievance="PR Scandal",
        standard="Twitter retraction",
        pass_threshold=70,
        deadline=deadline
    )

def test_submit_apology_success(contract, setup_gl_state):
    """Verifies that the offender can submit a valid apology successfully."""
    case_id = create_valid_case(contract, setup_gl_state)
    
    # Offender calls submit
    setup_gl_state.message.sender_address = Address("0x1111111111111111111111111111111111111111")
    contract.submit_apology(case_id, "I apologize", "https://twitter.com/post/123")
    
    assert contract.apology_text.get(case_id) == "I apologize"
    assert contract.apology_url.get(case_id) == "https://twitter.com/post/123"
    assert contract.status.get(case_id) == "SUBMITTED"

def test_submit_apology_non_existent(contract, setup_gl_state):
    """Verifies noping an apology for a non-existent case is rejected."""
    setup_gl_state.message.sender_address = Address("0x1111111111111111111111111111111111111111")
    with pytest.raises(Exception, match="Case does not exist"):
        contract.submit_apology("case_999", "Apology", "https://twitter.com")

def test_submit_apology_non_offender(contract, setup_gl_state):
    """Verifies that only the offender can submit the apology."""
    case_id = create_valid_case(contract, setup_gl_state)
    
    # Wronged party tries to submit
    setup_gl_state.message.sender_address = Address("0x2222222222222222222222222222222222222222")
    with pytest.raises(Exception, match="Only the offender can submit an apology"):
        contract.submit_apology(case_id, "Apology text", "https://twitter.com")

def test_submit_apology_invalid_state(contract, setup_gl_state):
    """Verifies that noping is rejected if the case is not in OPEN/FAILED state."""
    case_id = create_valid_case(contract, setup_gl_state)
    
    setup_gl_state.message.sender_address = Address("0x1111111111111111111111111111111111111111")
    contract.submit_apology(case_id, "Apology text", "https://twitter.com")
    
    # Case is now SUBMITTED. Submitting again should fail.
    with pytest.raises(Exception, match="Case is not in OPEN or FAILED status"):
        contract.submit_apology(case_id, "Another text", "https://twitter.com")

def test_submit_apology_empty_inputs(contract, setup_gl_state):
    """Verifies that submitting empty text AND url is rejected."""
    case_id = create_valid_case(contract, setup_gl_state)
    
    setup_gl_state.message.sender_address = Address("0x1111111111111111111111111111111111111111")
    with pytest.raises(Exception, match="Must provide either apology text or apology URL"):
        contract.submit_apology(case_id, "  ", "")

def test_submit_apology_url_malformed(contract, setup_gl_state):
    """Verifies that malformed URLs are rejected."""
    case_id = create_valid_case(contract, setup_gl_state)
    
    setup_gl_state.message.sender_address = Address("0x1111111111111111111111111111111111111111")
    with pytest.raises(Exception, match="Invalid URL format"):
        contract.submit_apology(case_id, "I apologize", "twitter.com/my-post")

def test_submit_apology_text_length(contract, setup_gl_state):
    """Verifies text exceeding character limit is rejected."""
    case_id = create_valid_case(contract, setup_gl_state)
    
    setup_gl_state.message.sender_address = Address("0x1111111111111111111111111111111111111111")
    huge_text = "A" * 10001
    with pytest.raises(Exception, match="Apology text exceeds maximum character limit of 10000"):
        contract.submit_apology(case_id, huge_text, "")
