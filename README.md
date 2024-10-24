| Questions | Granite-code:8b-instruct | Granite-code:8b-dense-instruct | Llama3.1:8b | Codestral-Mamba:7b | Starcoder2:7b |
| :----: | :----: | :----: | :----: | :----: | :----: |
| Lambda Function | a | 3 | 1 | 2 | 5 |
| Quicksort Code | a | 3 | 1 | 2 | 5 |
| Constructors/Desctructors Java | a | 3 | 1 | 2 | 5 |
| Binary Search Code | a | 3 | 1 | 2 | 5 |
| Debug the code | a | 3 | 1 | 2 | 5 |
| Port the code | a | 3 | 1 | 2 | 5 |
| Refactor code into Quarkus | a | 3 | 1 | 2 | 5 |
| Optimisation of code | a | 3 | 1 | 2 | 5 |
| Documentation of code | a | 3 | 1 | 2 | 5 |
| Unit Test of code | a | 3 | 1 | 2 | 5 |


Summary:

1. Granite-code:8b-instruct

Works well with basic chat questions, but is inconsistent, does not read full code and sometimes ignores the context.

2. Granite-code:8b-dense-instruct

Better than granite-code:8b, but the same problems with granite-code:8b is also in this model (inconsistency and incomplete code generation) - reads the full code.

3. Llama3.1:8b-instruct

Major Drawback: Speed to token generation is very slow. 

4. Codestral-mamba:7b

Not local.

5. Starcoder2:7b


(Granite is inconsistent, though sometimes the result is better than codestral. But since the results are inconsistent, the overall result is worse)
