# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *

def get_withdrawable_impl(self, addr: str) -> u256:
    try:
        target = Address(addr)
    except Exception:
        raise gl.vm.UserError(f"Invalid address: {addr}")
    return self.withdrawable_balance.get(target, u256(0))

def withdraw_impl(self) -> u256:
    sender = gl.message.sender_address
    amount = self.withdrawable_balance.get(sender, u256(0))
    if int(amount) == 0:
        raise gl.vm.UserError("No balance to withdraw")
    
    # Reset balance before transfer (re-entrancy defense)
    self.withdrawable_balance[sender] = u256(0)
    
    # Transfer using GenVM native value emit_transfer
    recipient_contract = gl.get_contract_at(sender.as_hex)
    recipient_contract.emit_transfer(value=amount, on='finalized')
    
    return amount
    
def credit_balance(self, recipient: Address, amount: u256) -> None:
    """Credits funds to an address's withdrawable balance."""
    if int(amount) <= 0:
        return
    current = self.withdrawable_balance.get(recipient, u256(0))
    self.withdrawable_balance[recipient] = u256(int(current) + int(amount))
