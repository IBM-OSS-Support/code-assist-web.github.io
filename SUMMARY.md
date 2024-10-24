| Questions | Granite-code:8b-instruct | Granite-code:8b-dense-instruct | Llama3.1:8b | Codestral-Mamba:7b | Starcoder2:7b |
| :----: | :----: | :----: | :----: | :----: | :----: |
| Lambda Function | 2 | 4 | 3 | 1 | 5 |
| Quicksort Code | 3 | 2 | 4 | 1 | 5 |
| Constructors/Desctructors Java | 1 | 4 | 3 | 2 | 5 |
| Binary Search Code | 3 | 1 | 4 | 2 | 5 |
| Debug the code | 4 | 3 | 1 | 2 | 5 |
| Port the code | 4 | 3 | 2 | 1 | 5 |
| Refactor code into Quarkus | 4 | 3 | 2 | 1 | 5 |
| Optimisation of code | 3 | 1 | 2 | 4 | 5 |
| Documentation of code | 4 | 3 | 2 | 1 | 5 |
| Unit Test of code | 4 | 3 | 1 | 2 | 5 |


Summary:

1. Granite-code:8b-instruct

Works well with basic chat questions, but is inconsistent, does not read full code and sometimes ignores the context.

2. Granite-code:8b-dense-instruct

Slightly better than granite-code:8b in terms of context awarenesss, but the same problems with granite-code:8b is also in this model (inconsistency and incomplete code generation).

3. Llama3.1:8b-instruct

Results are good but inconsistent, and most of the times too lengthy because of too much unwanted information. Reads the full code. Also, the speed of token generation is very slow making the overall result take too much time.

4. Codestral-mamba:7b

Best results out of all. The results are comparable to Github Copilot. Its USP is the speed of token generation. The result generation is fastest. The main issue is that it is not local.

5. Starcoder2:7b

Unusable and unstable. Prints the question in the result before printing the answer. The printed answer is usually garbage or unusable.

---------------------------------------------------------------------------------------------------

Granite is inconsistent, though sometimes the result is better than codestral. But since the results are inconsistent, the overall result is worse.
Some comparisons are subjective, as it depends on the user to prefer one result over the other.
