import React, { useEffect, useState } from "react";
import { Column, Grid, ComboBox, Button, Checkbox, DatePickerSkeleton, DatePicker, DatePickerInput, RadioButton, RadioButtonGroup, Tag } from "@carbon/react";
import "./_EvaluationComparison.scss";
import { format } from 'date-fns';

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
    const [allFileNames, setAllFileNames] = useState<string[]>([]);
    const [noResultsFound, setNoResultsFound] = useState<boolean>(false); // State to indicate no results found
    const [serverIP, setServerIP] = useState("localhost");
    const [serverPort, setServerPort] = useState<number>(5005); // Default to 5001
    const [selectedResult, setSelectedResult] = useState<string | null>(null);
    const [availableResults, setAvailableResults] = useState<string[]>([]);
    const [filteredFileNames, setFilteredFileNames] = useState<string[]>([]);
    const [selectedResults, setSelectedResults] = useState<{ [key: string]: string }>({});

    interface Model {
        name: string;
        created_at: string;
        file_name: string;
        prompt: { user: string; assistant: string; }[];
    }

    const getBackendURL = () => {
        // Use the frontend's origin to determine backend URL
        if (window.location.hostname === "localhost") {
            console.log("🚀 Local Development");
            return "http://localhost:5005"; // Local development
        } else {
            console.log("🔥 Fyre Machine");
            return "http://9.20.192.160:5005"; // Fyre Machine IP
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

                        // setAllFileNames(fileNames);
                        // console.log("fileNames::>", allFileNames);
                        

                        const fileResponses: any[] = await Promise.all(
                            fileNames.map(async (fileName: string) => {
                                return fetch(`http://${serverIP}:${serverPort}/api/models/${file}/files/${fileName}`)
                                    .then((r: Response) => r.json());
                            })
                        );

                        setAllFileNames(prev =>
                            [...prev, ...fileNames].reduce((acc, fileName) => 
                              acc.includes(fileName) ? acc : [...acc, fileName], [])
                          );
                        console.log("fileNames::>>", allFileNames);

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


    // Add utility functions for filename parsing
const parseFileName = (fileName: string) => {
    const match = fileName.match(/^(.+?)_(\d{8}T\d{6})\.json$/);
    if (!match) return null;
    return {
      modelName: match[1], // "granite3.1:8b"
      timestamp: match[2], // "20250302T101520"
      fullName: fileName
    };
  };
  
  const getModelBaseName = (fileName: string) => {
    const parts = fileName.split('_');
    if (parts.length < 2) return fileName;
    return parts[0].split(':')[0].replace(/\d+\.\d+/g, ''); // "granite"
  };
  
    // Updating getModelDetails function
    const getModelDetails = (name: string): { model: Model | undefined; modelJsonFiles: string[] } => {
        if (!modelsData || allFileNames.length === 0) {
          return { model: undefined, modelJsonFiles: [] };
        }
      
        // Get selected date for this model
        const selectedDate = selectedDates[name];

        // Convert selected date to YYYYMMDD format
        const formattedSelectedDate = selectedDate 
        ? new Date(selectedDate)
            .toISOString()
            .replace(/-/g, '')
            .substring(0, 8)
        : null;
      
        // Filter files based on model name and selected date
        const modelJsonFiles = allFileNames
        .map(fileName => parseFileName(fileName))
        .filter(file => {
          if (!file) return false;
          const baseName = getModelBaseName(file.modelName);
          const modelMatches = baseName.toLowerCase() === name.toLowerCase();
          
          if (!selectedDate) return false;
    
          const fileDate = file.timestamp.substring(0, 8);
          
          return modelMatches && fileDate === formattedSelectedDate;
        })    
        .sort((a, b) => (a?.timestamp || '').localeCompare(b?.timestamp || ''))
        .map(file => file?.fullName || '');
      
        // Find model data for selected result
        const selectedResult = selectedResults[name];
        const modelData = selectedResult 
          ? flattenedModels.find(m => m.file_name === selectedResult)
          : flattenedModels.find(m => m.name === name);
      
        return { model: modelData, modelJsonFiles };
      };
    
    // update filtered files when dates change
    useEffect(() => {
        const updateFilteredFiles = () => {
          const newFilteredFiles: string[] = [];
          [selectedGranite, selectedOther].forEach(modelName => {
            if (modelName && selectedDates[modelName]) {
              const filtered = allFileNames.filter(fileName => {
                const parsed = parseFileName(fileName);
                if (!parsed) return false;
                const fileDate = parsed.timestamp.substr(0, 8); // "20250302"
                return fileDate === selectedDates[modelName]?.replace(/-/g, '');
              });
              newFilteredFiles.push(...filtered);
            }
          });
          setFilteredFileNames(newFilteredFiles);
        };
      
        updateFilteredFiles();
      }, [selectedDates, selectedGranite, selectedOther, allFileNames]);

    // Add this after line 153 in your EvaluationComparison.tsx file
    const countFilesForModel = (modelName: string) => {
        const model = getModelDetails(modelName);
        if (!model) {
            console.warn(`Model with name ${modelName} not found`);
            return 0;
        }

        const existingFilePrefixes = allFileNames.filter(name => name.split('_')[0]).map(prefix => prefix.split('_')[0]);
        const modelPrefixCount = existingFilePrefixes.filter(prefix => prefix === modelName.split('_')[0]).length;
        const newFileCount = allFileNames.filter(fileName => 
          !existingFilePrefixes.includes(fileName.split('_')[0])
        ).length;
        const filesCount = modelPrefixCount;
        
        console.log(`Number of files for model ${modelName}: ${filesCount}`);
        console.log(`Occurrences of '${modelName}' prefix in existing files: ${modelPrefixCount}`);

        return filesCount;
    };
    
    console.log("modelsData:", modelsData);
    console.log("Potentially problematic models:", modelsData.filter(model => !model.name));


    const handleCompare = () => {
        if (selectedGranite && selectedOther) {
          setIsLoading(true);
          setTimeout(() => {
            setCompareClicked(true);
            setIsLoading(false);
          }, 2000);
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
        setSelectedResults({});
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

                {compareClicked && selectedGranite && selectedOther && !isLoading && (
                    <Column lg={16}>
                        <div style={{ display: "flex", justifyContent: "space-around", marginTop: "20px" }}>
                            {[selectedGranite, selectedOther].map((modelName) => {
                                console.log("1.modelName:::>>", modelName);

                                const model = getModelDetails(modelName);

                                console.log("modelmodel::", model);

                                if (model) {
                                    const numberOfFiles = countFilesForModel(modelName);
                                    console.log(`countFilesForModel for ${model}: ${numberOfFiles}`);
                                }

                                if (!model) return null;
                                const questionNumbers = ["All"];
                                const selectedQuestion = model.model ? selectedQuestions[model.model.name] || "All" : "All";

                                if (model && model.model) {
                                    questionNumbers.push(...model.model.prompt.map((_, index) => `Question ${index + 1}`));
                                }

                                const filteredPrompts = model?.model?.prompt?.filter((prompt) => {
                                    // Initialize selectedDates with an empty string if it doesn't exist
                                    const modelName = model?.model?.name ?? '';

                                    console.log("modelName:::", modelName, "modelJsonFiles", model?.modelJsonFiles);

                                    // If no date is selected for this model, show all prompts
                                    if (!selectedDates[modelName]) {
                                        return true;
                                    }

                                    const createdAtDate = model?.model?.created_at ? new Date(
                                        Number(model?.model?.created_at.substring(0, 4)),
                                        Number(model?.model?.created_at.substring(4, 6)) - 1,
                                        Number(model?.model?.created_at.substring(6, 8)),
                                        Number(model?.model?.created_at.substring(9, 11)),
                                        Number(model?.model?.created_at.substring(11, 13))
                                    ) : null;

                                    console.log(`filteredPrompts -- createdAtDate for ${model?.model?.name}:`, createdAtDate);

                                    if (!createdAtDate || isNaN(createdAtDate.getTime())) return false;
                                    
                                    const formattedDate = createdAtDate.toLocaleDateString('en-GB').split('/').reverse().join('-');  // Convert to DD-MM-YYYY

                                    console.log(`filteredPrompts -- formattedDate for ${model?.model?.name}:`, formattedDate , `selectedDates[modelName]:`, selectedDates[modelName]);

                                    const getModelName = (): string | undefined => {
                                        return model?.model?.name;
                                    };

                                    return formattedDate === selectedDates[getModelName() ?? '']; // Ensure date formats match
                                });

                                console.log(`Model: ${model?.model?.name}, Selected Date: ${selectedDates[modelName]}`);
                                console.log(`Prompts:`, model?.model?.prompt);
                                console.log(`Filtered Prompts:`, filteredPrompts);

                                return (
                                    <div id={`chat-outter-wrap-${model.model?.name}`} key={model?.model?.name} style={{ flex: 1, padding: "10px", border: "1px solid #ddd", borderRadius: "8px", margin: "0 5px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <h4 style={{ textTransform: "capitalize", marginBottom: "10px", marginTop: "0" }}>{model?.model?.name}</h4>
                                        </div>

                                        <p><strong>Description:</strong> Currently No Description Available.</p>

                                        <div style={{ margin: "0.5rem 0"}}>
                                            <Grid fullWidth narrow>
                                                <Column lg={8} md={8} sm={4}>
                                                    <DatePicker 
                                                        datePickerType="single"
                                                        className="question-date-picker"
                                                        dateFormat="d/m/Y"
                                                        maxDate={new Date().setDate(new Date().getDate())}
                                                        value={selectedDates[model?.model?.name ?? ''] ? new Date(selectedDates[model?.model?.name ?? ''] as string) : undefined}
                                                        // onChange={handleDateChange(model, selectedDates[model.name] ? new Date(selectedDates[model.name] as string) : null)}
                                                        onChange={(eventOrDates) => {
                                                            const dateValue = Array.isArray(eventOrDates) ? eventOrDates[0] : eventOrDates;
                                                            const formattedDate = dateValue 
                                                                ? new Date(dateValue.getTime() - (dateValue.getTimezoneOffset() * 60000))
                                                                    .toISOString()
                                                                    .split('T')[0]
                                                                : null;
                                                        
                                                            const modelName = model?.model?.name ?? 'default';
                                                            
                                                            // Update selected date and clear existing result
                                                            setSelectedDates(prev => ({
                                                              ...prev,
                                                              [modelName]: formattedDate
                                                            }));
                                                            
                                                            setSelectedResults(prev => ({
                                                              ...prev,
                                                              [modelName]: '' // Clear selected result when date changes
                                                            }));

                                                          }}
                                                    >
                                                        <DatePickerInput
                                                            id={`date-picker-${model?.model?.name}`}
                                                            placeholder="dd/mm/yyyy"
                                                            labelText="Select a Date"
                                                        />
                                                    </DatePicker>
                                                </Column>
                                                <Column lg={8} md={8} sm={4}>
                                                    <ComboBox
                                                        id={`result-combo-box-${model?.model?.name}`}
                                                        className="result-combo-box"
                                                        items={model?.modelJsonFiles || []}
                                                        itemToString={(item) => item ? `Result-${model?.modelJsonFiles?.indexOf(item) + 1}` : ''}
                                                        onChange={({ selectedItem }) => {
                                                            const currentModelName = model?.model?.name as string;
                                                            setSelectedResults(prev => ({
                                                            ...prev,
                                                            [currentModelName]: selectedItem as string
                                                            }));
                                                        }}
                                                        selectedItem={selectedResults[model?.model?.name as string] || 
                                                            (model?.modelJsonFiles?.length === 1 ? model.modelJsonFiles[0] : '')}
                                                        titleText="Select a Result"
                                                        placeholder="Choose a result"
                                                        disabled={!model?.modelJsonFiles?.length}
                                                    />
                                                    {/* <p id="result-warn-message" style={{ display: "block", color: "red", margin: "0.4rem 0", fontSize: "0.75rem" }}>Please select a result from dropdown.</p> */}
                                                </Column>
                                            </Grid>

                                            {model?.modelJsonFiles?.length > 0 && (selectedResults[model?.model?.name as string] || model?.modelJsonFiles?.length === 1) && (
                                                <Grid fullWidth narrow>
                                                    <Column lg={8} md={8} sm={4}>
                                                        <ComboBox
                                                            id={`question-combo-box-${model?.model?.name}`}
                                                            className="question-combo-box"
                                                            items={questionNumbers}
                                                            itemToString={(item) => (item ? item : '')}
                                                            onChange={({ selectedItem }) => setSelectedQuestions((prev) => ({
                                                            ...prev,
                                                            [model?.model?.name || 'default_key']: selectedItem as string
                                                            }))}
                                                            selectedItem={selectedQuestion}
                                                            titleText="Select a Question"
                                                        />
                                                    </Column>
                                                </Grid>
                                            )}
                                        </div>
                                        <p>
                                            <strong>Prompt:</strong>
                                        </p>

                                        <div>
                                            <Checkbox
                                                id={`solid-background-toggle-${model?.model?.name}`}
                                                className="solid-background-toggle"
                                                labelText="Remove Prompt Background Wallpaper"
                                                checked={model && model.model ? solidBackgrounds[model.model.name] || false : false}
                                                onChange={() => {
                                                    const modelName = model?.model?.name ?? 'default';
                                                    setSolidBackgrounds(prev => ({
                                                        ...prev, [modelName]: !prev[modelName]
                                                    }));
                                                }}
                                                style={{ float: "right" }}
                                            />
                                        </div>

                                        <div className={solidBackgrounds[model?.model?.name ?? 'default'] ? "chat-screen solid-bg" : "chat-screen"}>
                                            <div className="date-capsule-wrap">
                                                <Tag className="date-capsule" type="warm-grey">
                                                    {selectedDates[model?.model?.name ?? 'default'] 
                                                    ? format(new Date(selectedDates[model?.model?.name ?? 'default'] || ''), 'dd-MM-yyyy')
                                                    : 'Today'}
                                                </Tag>
                                            </div>
                                            {filteredPrompts && filteredPrompts.length === 0 ? (
                                                <div style={{ color: "#fff", background: "#606060cc", borderRadius: "4px", padding: "0.7rem", textAlign: "center", marginTop: "20px" }}>
                                                    No results found for the selected date. <br /><br /> Please select another date or Clear the date filter to see the latest prompt result.
                                                </div>
                                            ) : (
                                                <ul>
                                                    {selectedQuestion === "All" ? (
                                                        filteredPrompts && filteredPrompts.map((prompt, index) => (
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
                                                        filteredPrompts && filteredPrompts
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