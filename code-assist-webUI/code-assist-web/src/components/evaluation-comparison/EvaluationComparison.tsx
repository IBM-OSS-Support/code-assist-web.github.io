import React, { useEffect, useState } from "react";
import { Column, Grid, ComboBox, Button, Checkbox, DatePickerSkeleton, DatePicker, DatePickerInput, RadioButton, RadioButtonGroup } from "@carbon/react";
import "./_EvaluationComparison.scss";

const ModelComparison = () => {
    const [selectedGranite, setSelectedGranite] = useState<string | null>(null);
    const [selectedOther, setSelectedOther] = useState<string | null>(null);
    const [compareClicked, setCompareClicked] = useState<boolean>(false);
    const [solidBackgrounds, setSolidBackgrounds] = useState<{ [modelName: string]: boolean }>({});
    const [selectedQuestions, setSelectedQuestions] = useState<{ [modelName: string]: string }>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedDates, setSelectedDates] = useState<{ [modelName: string]: string | null }>({});
    const [compareOption, setCompareOption] = useState<string>("other"); // 'granite' or 'other'
    const [modelsData, setModelsData] = useState<Model[]>([]); // State to store fetched models data
    const [apiError, setApiError] = useState<string | null>(null); // State to handle API errors
    const [availableFiles, setAvailableFiles] = useState<string[]>([]); // State to store available files
    const [noResultsFound, setNoResultsFound] = useState<boolean>(false); // State to indicate no results found
    const [serverIP, setServerIP] = useState("localhost");
    const [serverPort, setServerPort] = useState<number>(5001); // Default to 5001

    interface Model {
        name: string;
        created_at: string;
        prompt: { user: string; assistant: string; created_at?: string }[];
    }

    const getBackendURL = () => {
        // Use the frontend's origin to determine backend URL
        if (window.location.hostname === "localhost") {
            console.log("🚀 Local Development");
            return "http://localhost:5001"; // Local development
        } else {
            console.log("🔥 Fyre Machine");
            return "http://9.20.192.160:5001"; // Fyre Machine IP
        }
    };
    
    const fetchServerIP = async () => {
        try {
            const backendURL = getBackendURL();
            const response = await fetch(`${backendURL}/server-ip`);
            const data = await response.json();
    
            if (data.ip) {
                return data.ip;
            } else {
                console.warn("⚠️ No IP found in response:", data);
                return "localhost";
            }
        } catch (error) {
            console.error("❌ Error fetching server IP:", error);
            return "localhost";
        }
    };

    // Fetch server IP on component mount
    useEffect(() => {
        fetchServerIP().then(ip => setServerIP(ip));
    }, []);

    // Fetch available files (model names) on component mount
    useEffect(() => {
        const fetchFileNames = async () => {
            try {
                const response = await fetch(`http://${serverIP}:${serverPort}/api/models`);
                if (!response.ok) throw new Error("Failed to fetch files");
                const files = await response.json();
                setAvailableFiles(files);
            } catch (error) {
                console.error("Error fetching files:", error);
                setApiError("Failed to fetch available files. Please try again later.");
            }
        };
        fetchFileNames();
    }, [serverIP, serverPort]);

    // Fetch models data when compare option changes or date changes
    useEffect(() => {
        const fetchModelData = async () => {
            setIsLoading(true);
            setApiError(null);
            setNoResultsFound(false);
            try {
                const responses = await Promise.all(
                    availableFiles.map(async file => {
                        const date = selectedDates[file] || null;
                        let fileNames = await fetch(`http://${serverIP}:${serverPort}/api/models/${file}/files`).then(r => r.json());
                        fileNames = fileNames.flat();
                        
                        const fileResponses: any[] = await Promise.all(
                            fileNames.map(async (fileName: string) => {
                                return fetch(`http://${serverIP}:${serverPort}/api/models/${file}/files/${fileName}`)
                                    .then((r: Response) => r.json());
                            })
                        );
        
                        return fileResponses.flat();
                    })
                );
        
                // Normalize response structure
                const allModels = responses.flatMap(response => 
                    Object.values(response).flat()
                );
        
                console.log("Normalized Models:", allModels);
        
                setModelsData(allModels);
            } catch (error) {
                console.error("Error fetching models:", error);
                setApiError("Failed to fetch models. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        if (availableFiles.length > 0) {
            fetchModelData();
        }
    }, [availableFiles, serverIP, serverPort, selectedDates]);

    // Prepare model lists
    const flattenedModels = modelsData.flatMap(item => Object.values(item).flat());

    const graniteModels = Array.from(new Set(
        flattenedModels
            .filter(model => model.name && model.name.toLowerCase().includes("granite"))
            .map(model => model.name)
    ));

    const otherModels = Array.from(new Set(
        flattenedModels
            .filter(model => model.name && !model.name.toLowerCase().includes("granite"))
            .map(model => model.name)
    ));

    console.log("Granite Models:", graniteModels);
    console.log("Other Models:", otherModels);

    const getModelDetails = (name: string): Model | undefined => {
        if (!modelsData || modelsData.length === 0) {
            console.warn("modelsData is empty or not populated");
            return undefined;
        }
    
        // Flattening again to avoid issues with nested structure
        const flattenedModels = modelsData.flatMap(item => Object.values(item).flat());
    
        const model = flattenedModels.find((model) => model.name === name);
    
        if (!model) {
            console.warn(`Model with name ${name} not found`);
        } else {
            console.log("Model found:", model);
        }
    
        return model;
    };
    

    const extractDateFromFileName = (fileName: string): string | null => {
        const match = fileName.match(/_(\d{8}T\d{6})\.json$/);
        return match ? match[1] : null; // Extracted format should match the expected input
    };
    

    console.log("modelsData:", modelsData);
    console.log("Potentially problematic models:", modelsData.filter(model => !model.name));


    const handleCompare = () => {
        if (selectedGranite && selectedOther) {
            setIsLoading(true);
            setTimeout(() => {
                setCompareClicked(true);
                setIsLoading(false);
            }, 2000); // Simulate a delay for loading
        }
    };

    const handleClear = () => {
        setSelectedGranite(null);
        setSelectedOther(null);
        setCompareClicked(false);
        setSolidBackgrounds({});
        setSelectedQuestions({});
        setSelectedDates({});
        setNoResultsFound(false);
    };

    const formatPromptWithCodeTags = (prompt: string): React.ReactNode => {
        const regex = /```(.*?)```/gs;
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
                <code key={offset} style={{ backgroundColor: "#101010", padding: "2px 10px", borderRadius: "4px", display: "block", wordBreak: "break-word" }}>
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
                    <div className="compare-option-wrap">
                        <RadioButtonGroup
                            legendText="Compare with:"
                            name="compare-option"
                            defaultSelected="other"
                            onChange={(value) => setCompareOption(value as string)}
                            disabled={isLoading}
                        >
                            <RadioButton labelText="Compare with Other AI Models" value="other" id="other-radio" />
                            <RadioButton labelText="Compare with Other Granite Models" value="granite" id="granite-radio" />
                        </RadioButtonGroup>
                    </div>
                </Column>
                <Column lg={16}>
                    <Grid narrow>
                        <Column lg={6}>
                            <ComboBox
                                key={selectedGranite}
                                id="granite-model-combo-box"
                                items={graniteModels}
                                itemToString={(item) => (item ? item : '')}
                                onChange={({ selectedItem }) => setSelectedGranite(selectedItem as string)}
                                selectedItem={selectedGranite} 
                                titleText="Select a Granite Model"
                                placeholder="Choose a Granite model"
                                disabled={isLoading}
                            />
                        </Column>
                        <Column lg={6}>
                            <ComboBox
                                key={selectedOther}
                                id="other-model-combo-box"
                                items={compareOption === "granite" ? graniteModels : otherModels}
                                itemToString={(item) => (item ? item : '')}
                                onChange={({ selectedItem }) => setSelectedOther(selectedItem as string)}
                                selectedItem={selectedOther} 
                                titleText={compareOption === "granite" ? "Select Another Granite Model" : "Select Other AI Model"}
                                placeholder={compareOption === "granite" ? "Choose another Granite model" : "Choose other AI model"}
                                disabled={isLoading}
                            />
                        </Column>
                        <Column lg={4}>
                            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                                <Button onClick={handleCompare} disabled={!selectedGranite || !selectedOther || isLoading}>Compare</Button>
                                <Button onClick={handleClear} kind="danger" disabled={!selectedGranite && !selectedOther || isLoading}>Clear</Button>
                            </div>
                        </Column>
                    </Grid>
                </Column>

                {isLoading && 
                    <Column lg={16}>
                        <div className="skeleton-wrap" style={{ display: "flex", width: "300px", height: "560px", alignItems: "center", justifyContent: "center", margin: "4rem auto 0" }}>
                            <DatePickerSkeleton range />
                        </div>
                    </Column>
                }
                {apiError && 
                    <Column lg={16}>
                        <div style={{ color: "red", textAlign: "center", marginTop: "20px" }}>
                            {apiError}
                        </div>
                    </Column>
                }
                {compareClicked && selectedGranite && selectedOther && !isLoading && modelsData && (
                    <Column lg={16}>
                        <div style={{ display: "flex", justifyContent: "space-around", marginTop: "20px" }}>
                            {[selectedGranite, selectedOther].map((modelName) => {
                                const model = getModelDetails(modelName);
                                if (!model) return null;

                                const questionNumbers = ["All", ...model.prompt.map((_, index) => `Question ${index + 1}`)];
                                const selectedQuestion = selectedQuestions[model.name] || "All";

                                const filteredPrompts = model.prompt.filter(prompt => {
                                    if (!selectedDates[model.name]) return true; // Show all prompts if no date is selected

                                    const createdAtDate = model.created_at ? new Date(model.created_at) : null;
                                    if (!createdAtDate || isNaN(createdAtDate.getTime())) return false;

                                    const formattedDate = createdAtDate.toLocaleDateString('en-GB').split('/').reverse().join('-');  // Convert to DD-MM-YYYY
                                    return formattedDate === selectedDates[model.name]; // Ensure date formats match
                                });

                                

                                console.log(`Model: ${model.name}, Selected Date: ${selectedDates[model.name]}`);
                                console.log(`Prompts:`, model.prompt);
                                console.log(`Filtered Prompts:`, filteredPrompts);

                                return (
                                    <div key={model.name} style={{ flex: 1, padding: "10px", border: "1px solid #ddd", borderRadius: "8px", margin: "0 5px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <h4 style={{ textTransform: "capitalize", marginBottom: "10px", marginTop: "0" }}>{model.name}</h4>
                                        </div>
                                        
                                        <p><strong>Description:</strong> Currently No Description Available.</p>

                                        <div style={{ margin: "0.5rem 0"}}>
                                            <Grid fullWidth narrow>
                                                <Column lg={8} md={8} sm={4}>
                                                    <ComboBox
                                                        id={`question-combo-box-${model.name}`}
                                                        className="question-combo-box"
                                                        items={questionNumbers}
                                                        itemToString={(item) => (item ? item : '')}
                                                        onChange={({ selectedItem }) => setSelectedQuestions((prev) => ({ ...prev, [model.name]: selectedItem as string }))}
                                                        selectedItem={selectedQuestion}
                                                        titleText="Select a Question"
                                                    />
                                                </Column>
                                                <Column lg={8} md={8} sm={4}>
                                                    <DatePicker 
                                                        datePickerType="single"
                                                        className="question-date-picker"
                                                        dateFormat="d/m/Y"
                                                        maxDate={new Date().setDate(new Date().getDate())}
                                                        value={selectedDates[model.name] ? new Date(selectedDates[model.name] as string) : undefined}
                                                        onChange={(eventOrDates) => {
                                                            const dateValue = Array.isArray(eventOrDates) ? eventOrDates[0] : eventOrDates;
                                                            const formattedDate = dateValue ? new Date(dateValue).toLocaleDateString('en-CA') : null;
                                                            console.log(`Selected date for ${model.name}: ${formattedDate}`);
                                                            setSelectedDates((prev) => ({ ...prev, [model.name]: formattedDate }));
                                                        }}
                                                    >
                                                        <DatePickerInput
                                                            id={`date-picker-${model.name}`}
                                                            placeholder="dd/mm/yyyy"
                                                            labelText="Select a Date"
                                                        />
                                                    </DatePicker>
                                                </Column>
                                            </Grid>
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
                                            {filteredPrompts.length === 0 ? (
                                                <div style={{ color: "#fff", background: "#606060cc", borderRadius: "4px", padding: "0.7rem", textAlign: "center", marginTop: "20px" }}>
                                                    No results found for the selected date. <br /><br /> Please select another date or Clear the date filter to view all prompts.
                                                </div>
                                            ) : (
                                                <ul>
                                                    {selectedQuestion === "All" ? (
                                                        filteredPrompts.map((prompt, index) => (
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
                                                        filteredPrompts
                                                            .filter((_, index) => index === parseInt(selectedQuestion.split(" ")[1]) - 1)
                                                            .map((prompt, index) => (
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
                                                    )}
                                                </ul>
                                            )}
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