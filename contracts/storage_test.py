# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *

class Contract(gl.Contract):
    test_map: TreeMap[str, str]

    def __init__(self):
        # TreeMaps auto-initialize; we must never reassign them in __init__.
        pass

    @gl.public.write
    def set_value(self, key: str, val: str) -> None:
        self.test_map[key] = val

    @gl.public.view
    def get_value(self, key: str) -> str:
        if key not in self.test_map:
            return ""
        return self.test_map[key]
