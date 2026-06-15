import pytest
from genlayer import Address

def test_open_case_success(contract, setup_gl_state):
    """Verifies that a valid case can be opened successfully."""
    setup_gl_state.message.sender_address = Address("0x1111111111111111111111111111111111111111")
    setup_gl_state.message.value = 10 * 10**18  # 10 GEN
    
    # 3 days deadline from current mock time (1770337073 epoch)
    deadline = 1770337073 + 3 * 24 * 60 * 60
    
    case_id = contract.open_case(
        wronged_addr="0x2222222222222222222222222222222222222222",
        charity_addr="0x3333333333333333333333333333333333333333",
        grievance="PR Scandal",
        standard="Apologize publicly on Twitter",
        pass_threshold=70,
        deadline=deadline
    )
    
    assert case_id == "case_0"
    assert contract.status.get(case_id) == "OPEN"
    assert contract.deposit.get(case_id) == 10 * 10**18
    assert contract.offender.get(case_id) == Address("0x1111111111111111111111111111111111111111")
    assert contract.wronged.get(case_id) == Address("0x2222222222222222222222222222222222222222")

def test_open_case_zero_deposit(contract, setup_gl_state):
    """Verifies opening a case with 0 deposit is rejected."""
    setup_gl_state.message.value = 0
    with pytest.raises(Exception, match="Deposit must be greater than zero"):
        contract.open_case(
            wronged_addr="0x2222222222222222222222222222222222222222",
            charity_addr="0x3333333333333333333333333333333333333333",
            grievance="Grievance",
            standard="Standard",
            pass_threshold=70,
            deadline=1770337073 + 86400
        )

def test_open_case_invalid_threshold(contract, setup_gl_state):
    """Verifies that invalid thresholds (e.g. > 100) are rejected."""
    setup_gl_state.message.value = 10**18
    
    with pytest.raises(Exception, match="Pass threshold must be between 0 and 100"):
        contract.open_case(
            wronged_addr="0x2222222222222222222222222222222222222222",
            charity_addr="0x3333333333333333333333333333333333333333",
            grievance="Grievance",
            standard="Standard",
            pass_threshold=101,
            deadline=1770337073 + 86400
        )

def test_open_case_past_deadline(contract, setup_gl_state):
    """Verifies that a deadline in the past is rejected."""
    setup_gl_state.message.value = 10**18
    
    with pytest.raises(Exception, match="Deadline must be in the future"):
        contract.open_case(
            wronged_addr="0x2222222222222222222222222222222222222222",
            charity_addr="0x3333333333333333333333333333333333333333",
            grievance="Grievance",
            standard="Standard",
            pass_threshold=70,
            deadline=contract._now() - 100  # Past time
        )

def test_open_case_self_deal(contract, setup_gl_state):
    """Verifies that an offender cannot set themselves as the wronged party."""
    setup_gl_state.message.sender_address = Address("0x1111111111111111111111111111111111111111")
    setup_gl_state.message.value = 10**18
    
    with pytest.raises(Exception, match="Offender cannot self-deal as wronged party"):
        contract.open_case(
            wronged_addr="0x1111111111111111111111111111111111111111", # Self
            charity_addr="0x3333333333333333333333333333333333333333",
            grievance="Grievance",
            standard="Standard",
            pass_threshold=70,
            deadline=1770337073 + 86400
        )

def test_open_case_zero_addresses(contract, setup_gl_state):
    """Verifies that both wronged and charity cannot be the zero address."""
    setup_gl_state.message.value = 10**18
    
    with pytest.raises(Exception, match="Either wronged or charity address must be non-zero"):
        contract.open_case(
            wronged_addr="0x0000000000000000000000000000000000000000",
            charity_addr="0x0000000000000000000000000000000000000000",
            grievance="Grievance",
            standard="Standard",
            pass_threshold=70,
            deadline=1770337073 + 86400
        )
