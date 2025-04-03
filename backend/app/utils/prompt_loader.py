import os
from pathlib import Path

def load_prompt(prompt_path: str) -> str:
    """
    Load a prompt from the prompts directory
    
    Args:
        prompt_path: Path relative to the prompts directory
        
    Returns:
        The prompt content as a string
    """
    base_dir = Path(__file__).resolve().parent.parent
    prompt_file = base_dir / "prompts" / prompt_path
    
    try:
        with open(prompt_file, "r", encoding="utf-8") as f:
            return f.read().strip()
    except FileNotFoundError:
        raise ValueError(f"Prompt file not found: {prompt_file}")