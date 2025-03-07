import json
import re
import os
from datetime import datetime

def clean_content(content):
    # Remove ">" symbols from the start of each line in the content
    lines = content.split('\n')
    cleaned_lines = [re.sub(r'^>+\s*', '', line) for line in lines]
    return '\n'.join(cleaned_lines)

def parse_md_to_json(filename):
    conversation = {
        "0": [
            {
                "name": "ENTER MODEL NAME HERE",
                "desc": "ENTER OTHER DETAILS HERE",
                "prompt": []
            }
        ]
    }
    
    user_content = None
    assistant_content = None
    current_role = None
    current_content = []
    first_assistant_block_skipped = False
    
    with open(filename, 'r', encoding='utf-8') as file:
        lines = file.readlines()
    
    for line in lines:
        # Remove both single and double ">" symbols and leading/trailing whitespace
        line = re.sub(r'^>+\s*', '', line).rstrip()
        
        # Check for role headers
        assistant_match = re.match(r'^#### _Assistant_\s*$', line)
        user_match = re.match(r'^#### _User_\s*$', line)
        
        # Skip empty lines
        if not line:
            continue
            
        if assistant_match or user_match:
            # Save previous content
            if current_content and current_role:
                content = '\n'.join(line for line in current_content if line.strip())
                content = clean_content(content)
                
                if content and not content.strip().lower() == "/share":
                    if current_role == "User":
                        # If we have previous pair, save it first
                        if user_content is not None and assistant_content is not None:
                            conversation["0"][0]["prompt"].append({
                                "user": user_content,
                                "assistant": assistant_content
                            })
                        user_content = content
                        assistant_content = None
                    elif current_role == "Assistant" and not first_assistant_block_skipped:
                        first_assistant_block_skipped = True
                    elif current_role == "Assistant" and user_content is not None:
                        assistant_content = content
                        conversation["0"][0]["prompt"].append({
                            "user": user_content,
                            "assistant": assistant_content
                        })
                        user_content = None
                        assistant_content = None
            
            # Set new role
            current_role = "Assistant" if assistant_match else "User"
            current_content = []
                
        else:
            # Skip the "/share" message
            if line.strip().lower() == "/share":
                continue
            # Append content to current message
            current_content.append(line)
    
    # Handle the last message
    if current_content and current_role:
        content = '\n'.join(line for line in current_content if line.strip())
        content = clean_content(content)
        if content and not content.strip().lower() == "/share":
            if current_role == "Assistant" and user_content is not None:
                conversation["0"][0]["prompt"].append({
                    "user": user_content,
                    "assistant": content
                })
    
    return conversation

# Use the function with correct path
input_filename = '20250307T130350_session.md'
file = os.path.join('outputfiles', input_filename )
result = parse_md_to_json(file)

# Save to JSON file in outputfiles directory
output_filename = input_filename.join('.json')
output_file = os.path.join('outputfiles', output_filename)
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=2, ensure_ascii=False)