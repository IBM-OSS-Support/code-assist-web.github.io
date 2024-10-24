This project contains testcases for VS Code Granite Project.

The main folder has the following files:
SUMMARY.md has a table of ranked results focused on accuracy and precision as well a sa brief summary for each model for how well they performed.

test-cases has the 10 questions/scenarios we are testing against the following models.
Granite-code:8b-instruct 	
Granite-code:8b-dense-instruct 	
Llama3.1:8b 	
Codestral-Mamba:7b 	
Starcoder2:7b

documentation.py documentation_with_bugs.py code_to_optimize.py are used in the 10 questions/scenarios for testing.

The chat-results folder contains the output for each iteration. We run the 10 scenarios in sequence 3 times to measure consistency/precision

documentation-results are from a previous test for documenting code that is now question/scenario #9.
