import yaml
import logging
import re
from typing import Any, Dict, Optional, Union

logger = logging.getLogger(__name__)

def remove_non_ascii(text):
    """Remove non-ASCII characters from a string."""
    return ''.join(char for char in text if ord(char) < 128)

def extract_response_from_yaml(content: str, default_response: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Extract and parse YAML content from LLM responses, handling code blocks.
    
    Args:
        content (str): The raw content from the LLM response that may contain YAML
        default_response (Dict[str, Any], optional): The default response to return in case of parsing error.
            Defaults to None.
            
    Returns:
        Dict[str, Any]: The parsed YAML content as a dictionary
    """
    if default_response is None:
        default_response = {}
        
    try:
        # Use the tested extraction function
        result = extract_yaml_from_response(content)
        
        # Convert string boolean values to actual booleans if needed
        if "mcq_expected" in result and isinstance(result["mcq_expected"], str):
            result["mcq_expected"] = result["mcq_expected"].lower() in ("true", "yes", "1")
            
        return result
    except Exception as e:
        logger.error(f"Error extracting YAML content: {str(e)}")
        logger.error(f"Failed content: '{content}'")
        return default_response

def extract_yaml_from_response(response):
    """Extract and parse YAML content from the response."""
    r = remove_non_ascii(response)

    parts = r.split('```')
    if len(parts) < 3 or 'yaml' not in parts[1]:
        raise ValueError(f"Could not find yaml after splitting. Response: {r}")
 
    # Extract the middle part which is expected to contain the YAML content
    yaml_content = parts[-2].strip()
    # Remove 'yaml' keyword if present and clean up the content
    yaml_content = yaml_content.replace('yaml', '', 1).strip()
 
    try:
        # Parse the YAML content
        parsed_yaml = yaml.safe_load(yaml_content)
    except yaml.YAMLError as e:
        raise ValueError(f"Exception while loading YAML: {yaml_content}\nError: {e}")

    return parsed_yaml