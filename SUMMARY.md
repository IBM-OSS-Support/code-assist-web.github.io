### Comparison table for different models ranked 1 (Best) -> 5 (Worst)

> [!NOTE]
> $${\color{green}Green}$$ indicates that the model succeeded in all three iterations. $${\color{Orange}Orange}$$ means it succeeded in at least one iteration but not in all three. $${\color{red}Red}$$ means it failed in all three iterations.

<img width="586" alt="image" src="https://github.com/user-attachments/assets/c7963c12-5c74-42d6-ac2f-13951d878d6c">

### Average timing comparison of different models
| Questions | Granite-code:8b-instruct | granite3-dense:8b | Llama3.1:8b |
| :----: | :----: | :----: | :----: |
| Lambda Function |  7671.49 ms |   9759.53 ms | 27867.56 ms | 
| Quicksort Code | 7984.16 ms | 13163.09 ms| 35300.37 ms |
| Constructors/Desctructors Java | 20128.85 ms | 16603.52 ms | 44066.22 ms |
| Binary Search Code | 20013.74 ms| 24424.41 ms | 44469.09 ms |
| Debug the code | 23764.16 ms | 61535.52 ms | 81078.74 ms  |
| Port the code | 71351.14 ms | 69910.73 ms | 103004.82 ms|
| Refactor code into Quarkus | 81471.42 ms | 62507.44 ms | 98524.59 ms |
| Optimization of code | 51825.82 ms | 37054.33 ms | 49334.90 ms |
| Documentation of code | 49589.85 ms | 64780.98 ms | 98268.18 ms |
| Unit Test of code | 95197.65 ms | 68422.32 ms | 64526.62 ms | 

### Summary:

**Codestral-mamba:7b**
Best overall results. Accuracy is very good on 7 questions. ollama did not return response time, but the result generation is very faster in all scenarios. 

**Llama3.1:8b-instruct**
Results are accurate but inconsistent, and often verbose with explanation. Reads the full code. Slowest response time of all models tested.

**granite3-dense:2b**
Comparable to other models in the granite3 family. Better than granite-code second generation. Very Fast response.

**granite3-dense:8b**
Better than granite-code:8b with context awarenesss, but the same issues with granite-code:8b is also in this model (inconsistency and incomplete code generation). Too slow for tab code complete. 

**Starcoder2:7b**
Unusable and unstable. Prints the question in the result before printing the answer. The printed answer is usually garbage or unusable.

---------------------------------------------------------------------------------------------------

No model is completely consistent. For granite, in a few cases, the result is better than codestral. But since the results are inconsistent, the overall performance is worse.
Comparisons are focused on accuracy, completeness of response, and consistency between iterations.

For more details please refer to [chat-results](https://github.com/IBM-GC/vscode-granite-testcases/tree/main/chat-results)
