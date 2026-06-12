#!/usr/bin/env python3
import os
import re

def build():
    contracts_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    contracts_path = os.path.join(contracts_dir, "contracts")
    
    oracle_file = os.path.join(contracts_path, "apology_oracle.py")
    treasury_file = os.path.join(contracts_path, "apology_treasury.py")
    core_file = os.path.join(contracts_path, "apology_core.py")
    output_file = os.path.join(contracts_path, "apology_escrow.py")
    
    # Read files
    with open(oracle_file, "r") as f:
        oracle_content = f.read()
        
    with open(treasury_file, "r") as f:
        treasury_content = f.read()
        
    with open(core_file, "r") as f:
        core_content = f.read()
        
    # Clean oracle: strip headers and imports
    oracle_lines = oracle_content.splitlines()
    cleaned_oracle = []
    for line in oracle_lines:
        if line.startswith("#") or line.startswith("from genlayer import") or line.startswith("import "):
            if not ("json" in line or "re" in line or "hashlib" in line):
                continue
        cleaned_oracle.append(line)
    oracle_section = "\n".join(cleaned_oracle)
    
    # Clean treasury: strip headers and imports
    treasury_lines = treasury_content.splitlines()
    cleaned_treasury = []
    for line in treasury_lines:
        if line.startswith("#") or line.startswith("from genlayer import") or line.startswith("import "):
            continue
        cleaned_treasury.append(line)
    treasury_section = "\n".join(cleaned_treasury)
    
    # Clean core: strip try/except imports and headers
    core_content = re.sub(r'try:\s*from contracts\.apology_oracle.*?\s*except ImportError:\s*pass', '', core_content, flags=re.DOTALL)
    
    # Rename class ApologyEscrow(gl.Contract): to class Contract(gl.Contract):
    core_content = core_content.replace("class ApologyEscrow(gl.Contract):", "class Contract(gl.Contract):")
    
    core_lines = core_content.splitlines()
    cleaned_core = []
    for line in core_lines:
        if line.startswith("#") or line.startswith("from genlayer import") or line.startswith("import "):
            if not ("datetime" in line):
                continue
        cleaned_core.append(line)
    core_section = "\n".join(cleaned_core)
    
    # Flatten
    flattened = []
    flattened.append("# v0.2.16")
    flattened.append('# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }')
    flattened.append("from genlayer import *")
    flattened.append("import json")
    flattened.append("import re")
    flattened.append("import hashlib")
    flattened.append("from datetime import datetime")
    flattened.append("\n# ==========================================")
    flattened.append("# ORACLE & AI CONSENSUS MODULE")
    flattened.append("# ==========================================")
    flattened.append(oracle_section.strip())
    flattened.append("\n# ==========================================")
    flattened.append("# TREASURY MODULE")
    flattened.append("# ==========================================")
    flattened.append(treasury_section.strip())
    flattened.append("\n# ==========================================")
    flattened.append("# CORE LIFE-CYCLE & STORAGE MODULE")
    flattened.append("# ==========================================")
    flattened.append(core_section.strip())
    
    output_content = "\n".join(flattened) + "\n"
    
    # Write output
    with open(output_file, "w") as f:
        f.write(output_content)
        
    print(f"Successfully generated flat contract at: {output_file}")

if __name__ == "__main__":
    build()
