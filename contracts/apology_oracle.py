# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json
import re
import hashlib

def strip_html_tags(html_content: str) -> str:
    """Strips scripts, styles, and tags to yield plain text for the LLM."""
    text = re.sub(r'<script\b[^<]*(?:<(?!/script>)[^<]*)*</script>', ' ', html_content, flags=re.IGNORECASE)
    text = re.sub(r'<style\b[^<]*(?:<(?!/style>)[^<]*)*</style>', ' ', text, flags=re.IGNORECASE)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def clean_llm_json(text: str) -> str:
    """Defensively extracts and cleans JSON data from LLM responses."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if len(lines) >= 2:
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].startswith("```"):
                lines = lines[:-1]
            text = "\n".join(lines).strip()
            
    start_idx = text.find("{")
    end_idx = text.rfind("}")
    if start_idx == -1 or end_idx == -1 or start_idx > end_idx:
        raise gl.vm.UserError("Invalid JSON structure returned by LLM")
    text = text[start_idx:end_idx + 1]
    text = re.sub(r',\s*([\]}])', r'\1', text)
    return text

def compute_canary(case_id: str, text: str) -> str:
    """Computes a deterministic canary token based on input data."""
    combined = f"{case_id}:{text}"
    hasher = hashlib.sha256(combined.encode("utf-8"))
    return f"CANARY_{hasher.hexdigest()[:10]}"

def parse_llm_result(response) -> dict:
    if isinstance(response, dict):
        return response
    elif isinstance(response, str):
        cleaned = clean_llm_json(response)
        try:
            return json.loads(cleaned)
        except Exception as e:
            raise gl.vm.UserError(f"Failed to parse cleaned JSON: {str(e)}")
    else:
        raise gl.vm.UserError(f"Expected dict or str from LLM, got {type(response)}")

def get_dimension_score(data: dict, key: str) -> int:
    val = data.get(key, 0)
    try:
        val_int = int(val)
    except (ValueError, TypeError):
        val_int = 0
    return max(0, min(100, val_int))

def parse_score(data: dict, key_options=("score", "rating", "points", "value")) -> int:
    score_val = None
    for key in key_options:
        if key in data:
            score_val = data[key]
            break
    if score_val is None:
        raise gl.vm.UserError("No score key found in LLM response")
    try:
        score_int = int(score_val)
    except (ValueError, TypeError):
        raise gl.vm.UserError(f"Invalid score value: {score_val}")
    return max(0, min(100, score_int))
