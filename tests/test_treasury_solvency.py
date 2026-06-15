import pytest
from genlayer import Address

def test_withdraw_success(contract, setup_gl_state):
    """Verifies that user can pull withdraw their balance and it gets reset."""
    user = Address("0x5555555555555555555555555555555555555555")
    contract.credit_balance(user, 15 * 10**18)
    
    # User calls withdraw
    setup_gl_state.message.sender_address = user
    amount = contract.withdraw()
    
    assert amount == 15 * 10**18
    # Storage balance should be reset
    assert contract.withdrawable_balance.get(user) == 0
    # verify native transfer mock was invoked
    mock_recipient = setup_gl_state.get_contract_at(user.as_hex)
    mock_recipient.emit_transfer.assert_called_once_with(value=15 * 10**18, on='finalized')

def test_withdraw_zero_balance(contract, setup_gl_state):
    """Verifies that withdrawing with 0 balance fails."""
    setup_gl_state.message.sender_address = Address("0x5555555555555555555555555555555555555555")
    with pytest.raises(Exception, match="No balance to withdraw"):
        contract.withdraw()

def test_solvency_invariant_open_and_resolve(contract, setup_gl_state):
    """Ensures total deposit + dispute_stake + sum(withdrawable) is conserved across state changes."""
    offender = Address("0x1111111111111111111111111111111111111111")
    wronged = Address("0x2222222222222222222222222222222222222222")
    
    # 1. Open Case: deposit 10 GEN
    setup_gl_state.message.sender_address = offender
    setup_gl_state.message.value = 10 * 10**18
    case_id = contract.open_case(
        wronged_addr=wronged.as_hex,
        charity_addr="0x0000000000000000000000000000000000000000",
        grievance="PR Scandal",
        standard="Standard",
        pass_threshold=70,
        deadline=1770337073 + 86400
    )
    
    total_locked = contract.deposit.get(case_id, 0) + contract.dispute_stake.get(case_id, 0)
    total_withdrawable = sum(contract.withdrawable_balance.values())
    assert total_locked + total_withdrawable == 10 * 10**18
    
    # 2. Apology failed evaluation (Final Fail)
    contract.attempts[case_id] = 3
    contract.status[case_id] = "SUBMITTED"
    
    import json
    llm_output = {"score": 40, "no_deflection": 50, "verdict": "FAILS"}
    setup_gl_state.nondet.exec_prompt = lambda prompt, response_format=None: json.dumps(llm_output)
    
    contract.evaluate_apology(case_id)
    
    # Deposit is now 0 (transferred to withdrawable_balance of wronged)
    total_locked = contract.deposit.get(case_id, 0) + contract.dispute_stake.get(case_id, 0)
    total_withdrawable = sum(contract.withdrawable_balance.values())
    
    assert total_locked == 0
    assert contract.withdrawable_balance.get(wronged) == 10 * 10**18
    assert total_locked + total_withdrawable == 10 * 10**18
