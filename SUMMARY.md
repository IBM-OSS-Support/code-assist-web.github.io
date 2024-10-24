### Comparison table for different models ranked 1 (Best) -> 5 (Worst)

| Questions | Granite-code:8b-instruct | Granite-code:8b-dense-instruct | Llama3.1:8b | Codestral-Mamba:7b | Starcoder2:7b |
| :----: | :----: | :----: | :----: | :----: | :----: |
| Lambda Function | 2 | 4 | 3 | 1 | 5 |
| Quicksort Code | 3 | 2 | 4 | 1 | 5 |
| Constructors/Desctructors Java | 1 | 4 | 3 | 2 | 5 |
| Binary Search Code | 3 | 2 | 4 | 1 | 5 |
| Debug the code | 4 | 3 | 1 | 2 | 5 |
| Port the code | 4 | 3 | 2 | 1 | 5 |
| Refactor code into Quarkus | 4 | 3 | 2 | 1 | 5 |
| Optimisation of code | 3 | 1 | 2 | 4 | 5 |
| Documentation of code | 4 | 3 | 2 | 1 | 5 |
| Unit Test of code | 4 | 3 | 1 | 2 | 5 |


### Summary:
Over all ranking
#1 Codestral Mamba
#2 Lama3.1:8b
#3 Granite-code=8b-dense-instruct
#4 Granite-code-8b-instruct
#5 Starcoder2:7b

**1. Granite-code:8b-instruct**

Works well with basic chat questions, but is inconsistent, does not read full code and sometimes ignores the context.

**2. Granite-code:8b-dense-instruct**

Better than granite-code:8b in terms of context awarenesss, but the same problems with granite-code:8b is also in this model (inconsistency and incomplete code generation). More thorough. Generates well documented code in Q4.

**3. Llama3.1:8b-instruct**

Results are good but inconsistent, and most of the times too lengthy because of too much explanation. Reads the full code. Also, the speed of token generation is very slow making the overall result take too much time.

**4. Codestral-mamba:7b**

Best results out of all. Accuracy is good across 9 questions. Poor on debugging Q5. The response time result generation is the fastest in all scenarios. 

**5. Starcoder2:7b**

Unusable and unstable. Prints the question in the result before printing the answer. The printed answer is usually garbage or unusable.

---------------------------------------------------------------------------------------------------

No model is completely consistent. For granite, in a few cases, the result is better than codestral. But since the results are inconsistent, the overall performance is worse.
Comparisons are focused on accuracy, completeness of response, and consistency between iterations.
For more details please refer to [chat-results](https://github.com/IBM-GC/vscode-granite-testcases/tree/main/chat-results)
