import React, { useState } from "react";
import { Column, Grid, ComboBox, Button, Checkbox } from "@carbon/react";
import data from "../../prompt_result.json";
import "./_EvaluationComparison.scss";

const ModelComparison = () => {
    const [selectedGranite, setSelectedGranite] = useState<string | null>(null);
    const [selectedOther, setSelectedOther] = useState<string | null>(null);
    const [compareClicked, setCompareClicked] = useState<boolean>(false);
    const [solidBackgrounds, setSolidBackgrounds] = useState<{ [modelName: string]: boolean }>({});
    const [selectedQuestions, setSelectedQuestions] = useState<{ [modelName: string]: string }>({});

    interface Model {
        name: string;
        desc: string;
        prompt: { user: string; assistant: string; }[];
    }

    let modelsArray: Model[] = [];
    Object.keys(data).forEach(key => {
        modelsArray.push(...data[key as keyof typeof data]);
    });

    const graniteModels = Array.from(new Set(modelsArray.filter(model => model.name.toLowerCase().includes("granite")).map(model => model.name)));
    const otherModels = Array.from(new Set(modelsArray.filter(model => !model.name.toLowerCase().includes("granite")).map(model => model.name)));

    const getModelDetails = (name: string): Model | undefined => {
        return modelsArray.find((model) => model.name === name);
    };

    const handleCompare = () => {
        if (selectedGranite && selectedOther) {
            setCompareClicked(true);
        }
    };

    const handleClear = () => {
        setSelectedGranite(null);
        setSelectedOther(null);
        setCompareClicked(false);
        setSolidBackgrounds({});
        setSelectedQuestions({});
    };

    const formatPromptWithCodeTags = (prompt: string): React.ReactNode => {
        const regex = /'''(.*?)'''/gs;
        let lastIndex = 0;
        const parts: React.ReactNode[] = [];

        prompt.replace(regex, (match, codeBlock, offset) => {
            parts.push(
                prompt.slice(lastIndex, offset).split("\n").map((line, index) => (
                    <React.Fragment key={`${offset}-text-${index}`}>
                        {line}
                        <br />
                    </React.Fragment>
                ))
            );

            parts.push(
                <code key={offset} style={{ backgroundColor: "#101010", padding: "2px 10px", borderRadius: "4px", display: "block" }}>
                    {codeBlock.split("\n").map((line: string, index: number) => (
                        <React.Fragment key={`${offset}-code-${index}`}>
                            {line}
                            <br />
                        </React.Fragment>
                    ))}
                </code>
            );

            lastIndex = offset + match.length;
            return match;
        });

        parts.push(
            prompt.slice(lastIndex).split("\n").map((line, index) => (
                <React.Fragment key={`end-text-${index}`}>
                    {line}
                    <br />
                </React.Fragment>
            ))
        );

        return <>{parts}</>;
    };

    return (
        <div className="evaluation-comparison-wrap">
            <Grid fullWidth narrow className="page-content">
                <Column lg={16}>
                    <div className="heading-wrap">
                        <h3>Select Models for Comparison</h3>
                    </div>
                </Column>
                <Column lg={16}>
                    <Grid narrow>
                        <Column lg={6}>
                            <ComboBox
                                id="granite-model-combo-box"
                                items={graniteModels}
                                itemToString={(item) => (item ? item : '')}
                                onChange={({ selectedItem }) => setSelectedGranite(selectedItem as string)}
                                selectedItem={selectedGranite} 
                                titleText="Select a Granite Model"
                                placeholder="Choose a Granite model"
                            />
                        </Column>
                        <Column lg={6}>
                            <ComboBox
                                id="other-model-combo-box"
                                items={otherModels}
                                itemToString={(item) => (item ? item : '')}
                                onChange={({ selectedItem }) => setSelectedOther(selectedItem as string)}
                                selectedItem={selectedOther} 
                                titleText="Select Other AI Model"
                                placeholder="Choose other AI model"
                            />
                        </Column>
                        <Column lg={4}>
                            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                                <Button onClick={handleCompare} disabled={!selectedGranite || !selectedOther}>Compare</Button>
                                <Button onClick={handleClear} kind="danger" disabled={!selectedGranite && !selectedOther}>Clear</Button>
                            </div>
                        </Column>
                    </Grid>
                </Column>

                {compareClicked && selectedGranite && selectedOther && (
                    <Column lg={16}>
                        <div style={{ display: "flex", justifyContent: "space-around", marginTop: "20px" }}>
                            {[selectedGranite, selectedOther].map((modelName) => {
                                const model = getModelDetails(modelName);
                                if (!model) return null;

                                const questionNumbers = ["All", ...model.prompt.map((_, index) => `Question ${index + 1}`)];
                                const selectedQuestion = selectedQuestions[model.name] || "All";

                                return (
                                    <div key={model.name} style={{ flex: 1, padding: "10px", border: "1px solid #ddd", borderRadius: "8px", margin: "0 5px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <h4 style={{ textTransform: "capitalize", marginBottom: "10px", marginTop: "0" }}>{model.name}</h4>
                                        </div>
                                        
                                        <p><strong>Description:</strong> {model.desc}</p>

                                        <div style={{ margin: "0.5rem 0"}}>
                                            <ComboBox
                                                id={`question-combo-box-${model.name}`}
                                                className="question-combo-box"
                                                items={questionNumbers}
                                                itemToString={(item) => (item ? item : '')}
                                                onChange={({ selectedItem }) => setSelectedQuestions((prev) => ({ ...prev, [model.name]: selectedItem as string }))}
                                                selectedItem={selectedQuestion}
                                                titleText="Select a Question"
                                            />
                                        </div>
                                        
                                        <p>
                                            <strong>Prompt:</strong>
                                        </p>
                                        <div>
                                            <Checkbox
                                                id={`solid-background-toggle-${model.name}`}
                                                className="solid-background-toggle"
                                                labelText="Remove Prompt Background Wallpaper"
                                                checked={solidBackgrounds[model.name] || false}
                                                onChange={() => setSolidBackgrounds((prev) => ({ ...prev, [model.name]: !prev[model.name] }))}
                                                style={{ float: "right" }}
                                            />
                                        </div>
                                        <div className={solidBackgrounds[model.name] ? "chat-screen solid-bg" : "chat-screen"}>
                                            <ul>
                                                {selectedQuestion === "All" ? (
                                                    model.prompt.map((prompt, index) => (
                                                        <li key={index}>
                                                            <div className="user-message-bubble">
                                                                <strong>User</strong>
                                                                {formatPromptWithCodeTags(prompt.user)}
                                                            </div>
                                                            <div className="assistant-message-bubble">
                                                                <strong>Assistant</strong>
                                                                {formatPromptWithCodeTags(prompt.assistant)}
                                                            </div>
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li>
                                                        <div className="user-message-bubble">
                                                            <strong>User</strong>
                                                            {formatPromptWithCodeTags(model.prompt[parseInt(selectedQuestion.split(" ")[1]) - 1].user)}
                                                        </div>
                                                        <div className="assistant-message-bubble">
                                                            <strong>Assistant</strong>
                                                            {formatPromptWithCodeTags(model.prompt[parseInt(selectedQuestion.split(" ")[1]) - 1].assistant)}
                                                        </div>
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Column>
                )}
            </Grid>
        </div>
    );
};

export default ModelComparison;