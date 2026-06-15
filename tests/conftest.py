import sys
from unittest.mock import MagicMock, patch
import pytest

# 1. Create robust mock objects for GenVM SDK types
class MockAddress:
    def __init__(self, value="0x0000000000000000000000000000000000000000"):
        import re
        if isinstance(value, MockAddress):
            self.value = value.value
            return
        val_str = str(value).strip().lower()
        if not re.match(r"^0x[0-9a-f]{40}$", val_str):
            raise ValueError(f"Invalid hex address: {value}")
        self.value = val_str

    @property
    def as_hex(self):
        return self.value

    def __eq__(self, other):
        if other is None:
            return False
        if isinstance(other, MockAddress):
            return self.value == other.value
        if isinstance(other, str):
            return self.value == other.lower()
        return False

    def __str__(self):
        return self.value

    def __repr__(self):
        return f"Address({self.value})"

    def __hash__(self):
        return hash(self.value)


class MockTreeMap(dict):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def get(self, key, default=None):
        return super().get(key, default)


class MockUserError(Exception):
    pass


class MockContractBase:
    def __init__(self):
        # Automatically instantiate TreeMap annotations as MockTreeMap
        for base in self.__class__.__mro__:
            annotations = getattr(base, '__annotations__', {})
            for name, type_hint in annotations.items():
                if 'TreeMap' in str(type_hint):
                    setattr(self, name, MockTreeMap())

# 2. Setup the global mocked gl context
class GlMock:
    def __init__(self):
        self.message = MagicMock()
        self.message.sender_address = MockAddress("0x1111111111111111111111111111111111111111")
        self.message.origin_address = MockAddress("0x1111111111111111111111111111111111111111")
        self.message.value = 0
        self.message_raw = {
            "datetime": "2026-01-01T00:00:00Z",
            "is_init": False
        }
        self.vm = MagicMock()
        self.vm.UserError = MockUserError
        
        # Mocks for public decorators
        def dummy_decorator(f):
            return f
        self.public = MagicMock()
        self.public.write = dummy_decorator
        self.public.view = dummy_decorator
        self.public.write.payable = dummy_decorator
        
        self.nondet = MagicMock()
        self.eq_principle = MagicMock()
        
        # Mock class base
        self.Contract = MockContractBase
        
        # Keep track of calls to get_contract_at
        self.contracts = {}
        
    def get_contract_at(self, address):
        addr_str = str(MockAddress(address))
        if addr_str not in self.contracts:
            mock_contract = MagicMock()
            mock_contract.emit_transfer = MagicMock()
            self.contracts[addr_str] = mock_contract
        return self.contracts[addr_str]


gl_instance = GlMock()

# Create dummy genlayer module
genlayer_module = MagicMock()
genlayer_module.Address = MockAddress
genlayer_module.TreeMap = MockTreeMap
genlayer_module.u256 = int
genlayer_module.i256 = int
genlayer_module.gl = gl_instance

# Inject mock into system modules so the contract code can import it
sys.modules["genlayer"] = genlayer_module


# 3. Pytest fixtures for test orchestration
@pytest.fixture(autouse=True)
def setup_gl_state():
    """Resets global gl state before each test."""
    gl_instance.message.sender_address = MockAddress("0x1111111111111111111111111111111111111111")
    gl_instance.message.value = 0
    gl_instance.message_raw = {
        "datetime": "2026-01-01T00:00:00Z",
        "is_init": False
    }
    gl_instance.contracts.clear()
    
    # Setup mock behaviors
    gl_instance.eq_principle.prompt_comparative = lambda fn, principle: fn()
    gl_instance.nondet.exec_prompt = lambda prompt, response_format=None: '{"verdict": "QUALIFIES", "score": 85}'
    gl_instance.nondet.web.render = lambda url, mode=None: "<html>Apology content</html>"
    
    yield gl_instance


@pytest.fixture
def contract():
    """Initializes and returns a fresh Contract instance."""
    # Import the generated flat contract
    from contracts.apology_escrow import Contract
    return Contract()
