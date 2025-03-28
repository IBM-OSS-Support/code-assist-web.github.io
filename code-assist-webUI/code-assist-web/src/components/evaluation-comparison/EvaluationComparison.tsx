import React, { useEffect, useState } from "react";
import {
  Column,
  Grid,
  ComboBox,
  Button,
  Checkbox,
  DatePickerSkeleton,
  DatePicker,
  DatePickerInput,
  RadioButton,
  RadioButtonGroup,
  Tag,
  Dropdown,
} from "@carbon/react";
import "./_EvaluationComparison.scss";
import { format } from "date-fns";

const ModelComparison = () => {
  const [selectedGranite, setSelectedGranite] = useState<string | null>(null);
  const [selectedOther, setSelectedOther] = useState<string | null>(null);
  const [compareClicked, setCompareClicked] = useState<boolean>(false);
  const [solidBackgrounds, setSolidBackgrounds] = useState<{
    [modelName: string]: boolean;
  }>({});
  const [selectedQuestions, setSelectedQuestions] = useState<{
    [modelName: string]: string;
  }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedDates, setSelectedDates] = useState<{
    [modelName: string]: string | null;
  }>({});
  const [modelsData, setModelsData] = useState<Model[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [availableFiles, setAvailableFiles] = useState<string[]>([]);
  const [allFileNames, setAllFileNames] = useState<string[]>([]);
  const [noResultsFound, setNoResultsFound] = useState<boolean>(false);
  const [serverIP, setServerIP] = useState("localhost");
  const [serverPort, setServerPort] = useState<number>(5005);
  const [filteredFileNames, setFilteredFileNames] = useState<string[]>([]);
  const [selectedResults, setSelectedResults] = useState<{
    [key: string]: string;
  }>({});
  const [codeAssistData, setCodeAssistData] = useState<any>(null);
  const [modelScores, setModelScores] = useState<{ [key: string]: string }>({});
  const [graniteModels, setGraniteModels] = useState<string[]>([]);
  const [otherModels, setOtherModels] = useState<string[]>([]);

  interface Model {
    name: string;
    created_at: string;
    file_name: string;
    prompt: { user: string; assistant: string }[];
  }
  interface ParsedFile {
    modelName: string;
    timestamp: string;
    fullName: string;
  }
  interface CodeAssistData {
    [key: string]: Array<{
      Name: string;
      Data: Array<{
        Method: string;
        "Number of Problems Evaluated": number;
        Duration: string;
        "Pass@1": string;
        "BLEU Score": string;
        Observation: string;
        Response: string;
        Issue: string;
      }>;
    }>;
  }

  // GitHub configuration
  const GH_CONFIG = {
    owner: "IBM-OSS-Support",
    repo: "code-assist-web.github.io",
    branch: "git-api-integration", // Verify this branch exists
    basePath: "code-assist-webUI/code-assist-web/src/prompt-results",
    token: process.env.REACT_APP_GH_TOKEN,
  };

  const CACHE_TIME = 60 * 60 * 1000; // 1 hour

  // this is the helper function to filter valid models
  const getValidModels = (data: any[]): Model[] => {
    return data.filter(
      (item): item is Model =>
        item?.name && item?.created_at && item?.file_name && item?.prompt
    );
  };

  useEffect(() => {
    if (!GH_CONFIG.token) {
      console.error(
        "GitHub token missing! " +
          "Create .env.local with REACT_APP_GH_TOKEN=your_token " +
          "and restart development server"
      );
    }
  }, []);

  // Enhanced fetch with error handling

  //    gh_cache_aHR0cHM6Ly8vYXBpLmdpdGh1Yi5jb20vcmVwb3MvSUJNLU9TUy1TdXBwb3J0L2NvZGUtYXNzaXN0LXdlYi5naXRodWIuaW8vY29udGVudHMvY29kZS1hc3Npc3Qtd2ViVUkvY29kZS1hc3Npc3Qtd2ViL3NyYy9wcm9tcHQtcmVzdWx0cy9jbGF1ZGUzLjUtc29ubmV0P3JlZj1naXQtYXBpLWludGVncmF0aW9u
  // :
  // "{\"data\":[{\"name\":\"claude3.5sonnet_20250312T144522.json\",\"path\":\"code-assist-webUI/code-assist-web/src/prompt-results/claude3.5-sonnet/claude3.5sonnet_20250312T144522.json\",\"sha\":\"8b914c6a274b56cc103a049433cadb2813ef6877\",\"size\":9805,\"url\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/contents/code-assist-webUI/code-assist-web/src/prompt-results/claude3.5-sonnet/claude3.5sonnet_20250312T144522.json?ref=git-api-integration\",\"html_url\":\"https://github.com/IBM-OSS-Support/code-assist-web.github.io/blob/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/claude3.5-sonnet/claude3.5sonnet_20250312T144522.json\",\"git_url\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/git/blobs/8b914c6a274b56cc103a049433cadb2813ef6877\",\"download_url\":\"https://raw.githubusercontent.com/IBM-OSS-Support/code-assist-web.github.io/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/claude3.5-sonnet/claude3.5sonnet_20250312T144522.json\",\"type\":\"file\",\"_links\":{\"self\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/contents/code-assist-webUI/code-assist-web/src/prompt-results/claude3.5-sonnet/claude3.5sonnet_20250312T144522.json?ref=git-api-integration\",\"git\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/git/blobs/8b914c6a274b56cc103a049433cadb2813ef6877\",\"html\":\"https://github.com/IBM-OSS-Support/code-assist-web.github.io/blob/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/claude3.5-sonnet/claude3.5sonnet_20250312T144522.json\"}}],\"timestamp\":1743156106054}"
  // gh_cache_aHR0cHM6Ly8vYXBpLmdpdGh1Yi5jb20vcmVwb3MvSUJNLU9TUy1TdXBwb3J0L2NvZGUtYXNzaXN0LXdlYi5naXRodWIuaW8vY29udGVudHMvY29kZS1hc3Npc3Qtd2ViVUkvY29kZS1hc3Npc3Qtd2ViL3NyYy9wcm9tcHQtcmVzdWx0cy9ncHQtNG8/cmVmPWdpdC1hcGktaW50ZWdyYXRpb24=
  // :
  // "{\"data\":[{\"name\":\"gpt-4o_20250311T203629.json\",\"path\":\"code-assist-webUI/code-assist-web/src/prompt-results/gpt-4o/gpt-4o_20250311T203629.json\",\"sha\":\"0f62b850c2d179b461ee73a79fbd303fc643c3bf\",\"size\":2761,\"url\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/contents/code-assist-webUI/code-assist-web/src/prompt-results/gpt-4o/gpt-4o_20250311T203629.json?ref=git-api-integration\",\"html_url\":\"https://github.com/IBM-OSS-Support/code-assist-web.github.io/blob/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/gpt-4o/gpt-4o_20250311T203629.json\",\"git_url\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/git/blobs/0f62b850c2d179b461ee73a79fbd303fc643c3bf\",\"download_url\":\"https://raw.githubusercontent.com/IBM-OSS-Support/code-assist-web.github.io/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/gpt-4o/gpt-4o_20250311T203629.json\",\"type\":\"file\",\"_links\":{\"self\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/contents/code-assist-webUI/code-assist-web/src/prompt-results/gpt-4o/gpt-4o_20250311T203629.json?ref=git-api-integration\",\"git\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/git/blobs/0f62b850c2d179b461ee73a79fbd303fc643c3bf\",\"html\":\"https://github.com/IBM-OSS-Support/code-assist-web.github.io/blob/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/gpt-4o/gpt-4o_20250311T203629.json\"}},{\"name\":\"gpt-4o_20250311T204733.json\",\"path\":\"code-assist-webUI/code-assist-web/src/prompt-results/gpt-4o/gpt-4o_20250311T204733.json\",\"sha\":\"32539a80b20a23ac45c9f5d7b0d810921b2f9394\",\"size\":4056,\"url\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/contents/code-assist-webUI/code-assist-web/src/prompt-results/gpt-4o/gpt-4o_20250311T204733.json?ref=git-api-integration\",\"html_url\":\"https://github.com/IBM-OSS-Support/code-assist-web.github.io/blob/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/gpt-4o/gpt-4o_20250311T204733.json\",\"git_url\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/git/blobs/32539a80b20a23ac45c9f5d7b0d810921b2f9394\",\"download_url\":\"https://raw.githubusercontent.com/IBM-OSS-Support/code-assist-web.github.io/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/gpt-4o/gpt-4o_20250311T204733.json\",\"type\":\"file\",\"_links\":{\"self\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/contents/code-assist-webUI/code-assist-web/src/prompt-results/gpt-4o/gpt-4o_20250311T204733.json?ref=git-api-integration\",\"git\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/git/blobs/32539a80b20a23ac45c9f5d7b0d810921b2f9394\",\"html\":\"https://github.com/IBM-OSS-Support/code-assist-web.github.io/blob/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/gpt-4o/gpt-4o_20250311T204733.json\"}}],\"timestamp\":1743156106054}"
  // gh_cache_aHR0cHM6Ly8vYXBpLmdpdGh1Yi5jb20vcmVwb3MvSUJNLU9TUy1TdXBwb3J0L2NvZGUtYXNzaXN0LXdlYi5naXRodWIuaW8vY29udGVudHMvY29kZS1hc3Npc3Qtd2ViVUkvY29kZS1hc3Npc3Qtd2ViL3NyYy9wcm9tcHQtcmVzdWx0cy9ncmFuaXRlMy4xJTNBOGI/cmVmPWdpdC1hcGktaW50ZWdyYXRpb24=
  // :
  // "{\"data\":[{\"name\":\"granite3.1:8b_20250302T101520.json\",\"path\":\"code-assist-webUI/code-assist-web/src/prompt-results/granite3.1:8b/granite3.1:8b_20250302T101520.json\",\"sha\":\"19ea104b8fabcc129a52b96185016ffa314c0ad4\",\"size\":5267,\"url\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/contents/code-assist-webUI/code-assist-web/src/prompt-results/granite3.1:8b/granite3.1:8b_20250302T101520.json?ref=git-api-integration\",\"html_url\":\"https://github.com/IBM-OSS-Support/code-assist-web.github.io/blob/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/granite3.1:8b/granite3.1:8b_20250302T101520.json\",\"git_url\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/git/blobs/19ea104b8fabcc129a52b96185016ffa314c0ad4\",\"download_url\":\"https://raw.githubusercontent.com/IBM-OSS-Support/code-assist-web.github.io/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/granite3.1%3A8b/granite3.1%3A8b_20250302T101520.json\",\"type\":\"file\",\"_links\":{\"self\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/contents/code-assist-webUI/code-assist-web/src/prompt-results/granite3.1:8b/granite3.1:8b_20250302T101520.json?ref=git-api-integration\",\"git\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/git/blobs/19ea104b8fabcc129a52b96185016ffa314c0ad4\",\"html\":\"https://github.com/IBM-OSS-Support/code-assist-web.github.io/blob/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/granite3.1:8b/granite3.1:8b_20250302T101520.json\"}}],\"timestamp\":1743156106053}"
  // gh_cache_aHR0cHM6Ly8vYXBpLmdpdGh1Yi5jb20vcmVwb3MvSUJNLU9TUy1TdXBwb3J0L2NvZGUtYXNzaXN0LXdlYi5naXRodWIuaW8vY29udGVudHMvY29kZS1hc3Npc3Qtd2ViVUkvY29kZS1hc3Npc3Qtd2ViL3NyYy9wcm9tcHQtcmVzdWx0cy9ncmFuaXRlMy4yJTNBOGI/cmVmPWdpdC1hcGktaW50ZWdyYXRpb24=
  // :
  // "{\"data\":[{\"name\":\"granite3.2:8b_20250304T091520.json\",\"path\":\"code-assist-webUI/code-assist-web/src/prompt-results/granite3.2:8b/granite3.2:8b_20250304T091520.json\",\"sha\":\"96ba0bb19c0314a0814c56b9f9e2fee9538b2e2b\",\"size\":5269,\"url\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/contents/code-assist-webUI/code-assist-web/src/prompt-results/granite3.2:8b/granite3.2:8b_20250304T091520.json?ref=git-api-integration\",\"html_url\":\"https://github.com/IBM-OSS-Support/code-assist-web.github.io/blob/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/granite3.2:8b/granite3.2:8b_20250304T091520.json\",\"git_url\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/git/blobs/96ba0bb19c0314a0814c56b9f9e2fee9538b2e2b\",\"download_url\":\"https://raw.githubusercontent.com/IBM-OSS-Support/code-assist-web.github.io/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/granite3.2%3A8b/granite3.2%3A8b_20250304T091520.json\",\"type\":\"file\",\"_links\":{\"self\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/contents/code-assist-webUI/code-assist-web/src/prompt-results/granite3.2:8b/granite3.2:8b_20250304T091520.json?ref=git-api-integration\",\"git\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/git/blobs/96ba0bb19c0314a0814c56b9f9e2fee9538b2e2b\",\"html\":\"https://github.com/IBM-OSS-Support/code-assist-web.github.io/blob/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/granite3.2:8b/granite3.2:8b_20250304T091520.json\"}},{\"name\":\"granite3.2:8b_20250318T093415.json\",\"path\":\"code-assist-webUI/code-assist-web/src/prompt-results/granite3.2:8b/granite3.2:8b_20250318T093415.json\",\"sha\":\"dfe007a4fca0b02d4a9aaac1b9a2118df2584501\",\"size\":3957,\"url\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/contents/code-assist-webUI/code-assist-web/src/prompt-results/granite3.2:8b/granite3.2:8b_20250318T093415.json?ref=git-api-integration\",\"html_url\":\"https://github.com/IBM-OSS-Support/code-assist-web.github.io/blob/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/granite3.2:8b/granite3.2:8b_20250318T093415.json\",\"git_url\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/git/blobs/dfe007a4fca0b02d4a9aaac1b9a2118df2584501\",\"download_url\":\"https://raw.githubusercontent.com/IBM-OSS-Support/code-assist-web.github.io/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/granite3.2%3A8b/granite3.2%3A8b_20250318T093415.json\",\"type\":\"file\",\"_links\":{\"self\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/contents/code-assist-webUI/code-assist-web/src/prompt-results/granite3.2:8b/granite3.2:8b_20250318T093415.json?ref=git-api-integration\",\"git\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/git/blobs/dfe007a4fca0b02d4a9aaac1b9a2118df2584501\",\"html\":\"https://github.com/IBM-OSS-Support/code-assist-web.github.io/blob/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/granite3.2:8b/granite3.2:8b_20250318T093415.json\"}}],\"timestamp\":1743156106055}"
  // gh_cache_aHR0cHM6Ly8vYXBpLmdpdGh1Yi5jb20vcmVwb3MvSUJNLU9TUy1TdXBwb3J0L2NvZGUtYXNzaXN0LXdlYi5naXRodWIuaW8vY29udGVudHMvY29kZS1hc3Npc3Qtd2ViVUkvY29kZS1hc3Npc3Qtd2ViL3NyYy9wcm9tcHQtcmVzdWx0cy9sbGFtYTMuMj9yZWY9Z2l0LWFwaS1pbnRlZ3JhdGlvbg==
  // :
  // "{\"data\":[{\"name\":\"llama3.2_20250306T121520.json\",\"path\":\"code-assist-webUI/code-assist-web/src/prompt-results/llama3.2/llama3.2_20250306T121520.json\",\"sha\":\"db0a2cb50611520dc3ba85113989336596d4698e\",\"size\":2621,\"url\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/contents/code-assist-webUI/code-assist-web/src/prompt-results/llama3.2/llama3.2_20250306T121520.json?ref=git-api-integration\",\"html_url\":\"https://github.com/IBM-OSS-Support/code-assist-web.github.io/blob/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/llama3.2/llama3.2_20250306T121520.json\",\"git_url\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/git/blobs/db0a2cb50611520dc3ba85113989336596d4698e\",\"download_url\":\"https://raw.githubusercontent.com/IBM-OSS-Support/code-assist-web.github.io/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/llama3.2/llama3.2_20250306T121520.json\",\"type\":\"file\",\"_links\":{\"self\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/contents/code-assist-webUI/code-assist-web/src/prompt-results/llama3.2/llama3.2_20250306T121520.json?ref=git-api-integration\",\"git\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/git/blobs/db0a2cb50611520dc3ba85113989336596d4698e\",\"html\":\"https://github.com/IBM-OSS-Support/code-assist-web.github.io/blob/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/llama3.2/llama3.2_20250306T121520.json\"}},{\"name\":\"llama3.2_20250306T124539.json\",\"path\":\"code-assist-webUI/code-assist-web/src/prompt-results/llama3.2/llama3.2_20250306T124539.json\",\"sha\":\"150e375fb8fd774ca957f0847a57cda21d7e7261\",\"size\":977,\"url\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/contents/code-assist-webUI/code-assist-web/src/prompt-results/llama3.2/llama3.2_20250306T124539.json?ref=git-api-integration\",\"html_url\":\"https://github.com/IBM-OSS-Support/code-assist-web.github.io/blob/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/llama3.2/llama3.2_20250306T124539.json\",\"git_url\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/git/blobs/150e375fb8fd774ca957f0847a57cda21d7e7261\",\"download_url\":\"https://raw.githubusercontent.com/IBM-OSS-Support/code-assist-web.github.io/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/llama3.2/llama3.2_20250306T124539.json\",\"type\":\"file\",\"_links\":{\"self\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/contents/code-assist-webUI/code-assist-web/src/prompt-results/llama3.2/llama3.2_20250306T124539.json?ref=git-api-integration\",\"git\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/git/blobs/150e375fb8fd774ca957f0847a57cda21d7e7261\",\"html\":\"https://github.com/IBM-OSS-Support/code-assist-web.github.io/blob/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/llama3.2/llama3.2_20250306T124539.json\"}},{\"name\":\"llama3.2_20250306T164540.json\",\"path\":\"code-assist-webUI/code-assist-web/src/prompt-results/llama3.2/llama3.2_20250306T164540.json\",\"sha\":\"45c4f97b2ebda6354c98dd96ddc242c37ba78c10\",\"size\":1458,\"url\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/contents/code-assist-webUI/code-assist-web/src/prompt-results/llama3.2/llama3.2_20250306T164540.json?ref=git-api-integration\",\"html_url\":\"https://github.com/IBM-OSS-Support/code-assist-web.github.io/blob/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/llama3.2/llama3.2_20250306T164540.json\",\"git_url\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/git/blobs/45c4f97b2ebda6354c98dd96ddc242c37ba78c10\",\"download_url\":\"https://raw.githubusercontent.com/IBM-OSS-Support/code-assist-web.github.io/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/llama3.2/llama3.2_20250306T164540.json\",\"type\":\"file\",\"_links\":{\"self\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/contents/code-assist-webUI/code-assist-web/src/prompt-results/llama3.2/llama3.2_20250306T164540.json?ref=git-api-integration\",\"git\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/git/blobs/45c4f97b2ebda6354c98dd96ddc242c37ba78c10\",\"html\":\"https://github.com/IBM-OSS-Support/code-assist-web.github.io/blob/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/llama3.2/llama3.2_20250306T164540.json\"}}],\"timestamp\":1743156106055}"
  // gh_cache_aHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS9yZXBvcy9JQk0tT1NTLVN1cHBvcnQvY29kZS1hc3Npc3Qtd2ViLmdpdGh1Yi5pby9jb250ZW50cy9jb2RlLWFzc2lzdC13ZWJVSS9jb2RlLWFzc2lzdC13ZWIvc3JjL3Byb21wdC1yZXN1bHRzP3JlZj1naXQtYXBpLWludGVncmF0aW9u
  // :
  // "{\"data\":[{\"name\":\"claude3.5-sonnet\",\"path\":\"code-assist-webUI/code-assist-web/src/prompt-results/claude3.5-sonnet\",\"sha\":\"a62233417adf0997b7f27a1e3a9be4e2b1d8e9d9\",\"size\":0,\"url\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/contents/code-assist-webUI/code-assist-web/src/prompt-results/claude3.5-sonnet?ref=git-api-integration\",\"html_url\":\"https://github.com/IBM-OSS-Support/code-assist-web.github.io/tree/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/claude3.5-sonnet\",\"git_url\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/git/trees/a62233417adf0997b7f27a1e3a9be4e2b1d8e9d9\",\"download_url\":null,\"type\":\"dir\",\"_links\":{\"self\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/contents/code-assist-webUI/code-assist-web/src/prompt-results/claude3.5-sonnet?ref=git-api-integration\",\"git\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/git/trees/a62233417adf0997b7f27a1e3a9be4e2b1d8e9d9\",\"html\":\"https://github.com/IBM-OSS-Support/code-assist-web.github.io/tree/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/claude3.5-sonnet\"}},{\"name\":\"gpt-4o\",\"path\":\"code-assist-webUI/code-assist-web/src/prompt-results/gpt-4o\",\"sha\":\"349f21e81d93175f53ac0746e23d25df97269abf\",\"size\":0,\"url\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/contents/code-assist-webUI/code-assist-web/src/prompt-results/gpt-4o?ref=git-api-integration\",\"html_url\":\"https://github.com/IBM-OSS-Support/code-assist-web.github.io/tree/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/gpt-4o\",\"git_url\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/git/trees/349f21e81d93175f53ac0746e23d25df97269abf\",\"download_url\":null,\"type\":\"dir\",\"_links\":{\"self\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/contents/code-assist-webUI/code-assist-web/src/prompt-results/gpt-4o?ref=git-api-integration\",\"git\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/git/trees/349f21e81d93175f53ac0746e23d25df97269abf\",\"html\":\"https://github.com/IBM-OSS-Support/code-assist-web.github.io/tree/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/gpt-4o\"}},{\"name\":\"granite3.1:8b\",\"path\":\"code-assist-webUI/code-assist-web/src/prompt-results/granite3.1:8b\",\"sha\":\"d757a55b30652c80f7b383d9b4c3cb87427c30c2\",\"size\":0,\"url\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/contents/code-assist-webUI/code-assist-web/src/prompt-results/granite3.1:8b?ref=git-api-integration\",\"html_url\":\"https://github.com/IBM-OSS-Support/code-assist-web.github.io/tree/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/granite3.1:8b\",\"git_url\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/git/trees/d757a55b30652c80f7b383d9b4c3cb87427c30c2\",\"download_url\":null,\"type\":\"dir\",\"_links\":{\"self\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/contents/code-assist-webUI/code-assist-web/src/prompt-results/granite3.1:8b?ref=git-api-integration\",\"git\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/git/trees/d757a55b30652c80f7b383d9b4c3cb87427c30c2\",\"html\":\"https://github.com/IBM-OSS-Support/code-assist-web.github.io/tree/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/granite3.1:8b\"}},{\"name\":\"granite3.2:8b\",\"path\":\"code-assist-webUI/code-assist-web/src/prompt-results/granite3.2:8b\",\"sha\":\"04cc541fc84a0dadee7b90fbca26ed1052ea8b03\",\"size\":0,\"url\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/contents/code-assist-webUI/code-assist-web/src/prompt-results/granite3.2:8b?ref=git-api-integration\",\"html_url\":\"https://github.com/IBM-OSS-Support/code-assist-web.github.io/tree/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/granite3.2:8b\",\"git_url\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/git/trees/04cc541fc84a0dadee7b90fbca26ed1052ea8b03\",\"download_url\":null,\"type\":\"dir\",\"_links\":{\"self\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/contents/code-assist-webUI/code-assist-web/src/prompt-results/granite3.2:8b?ref=git-api-integration\",\"git\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/git/trees/04cc541fc84a0dadee7b90fbca26ed1052ea8b03\",\"html\":\"https://github.com/IBM-OSS-Support/code-assist-web.github.io/tree/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/granite3.2:8b\"}},{\"name\":\"llama3.2\",\"path\":\"code-assist-webUI/code-assist-web/src/prompt-results/llama3.2\",\"sha\":\"d7ea0b39f557f938c4e6c883b8dd62faec325204\",\"size\":0,\"url\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/contents/code-assist-webUI/code-assist-web/src/prompt-results/llama3.2?ref=git-api-integration\",\"html_url\":\"https://github.com/IBM-OSS-Support/code-assist-web.github.io/tree/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/llama3.2\",\"git_url\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/git/trees/d7ea0b39f557f938c4e6c883b8dd62faec325204\",\"download_url\":null,\"type\":\"dir\",\"_links\":{\"self\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/contents/code-assist-webUI/code-assist-web/src/prompt-results/llama3.2?ref=git-api-integration\",\"git\":\"https://api.github.com/repos/IBM-OSS-Support/code-assist-web.github.io/git/trees/d7ea0b39f557f938c4e6c883b8dd62faec325204\",\"html\":\"https://github.com/IBM-OSS-Support/code-assist-web.github.io/tree/git-api-integration/code-assist-webUI/code-assist-web/src/prompt-results/llama3.2\"}}],\"timestamp\":1743156106005}"
  // length
  // :
  // 6
  const githubFetch = async (url: string) => {
    debugger;
    try {
      const name = url.split("/").pop()?.split("?")[0] || "default";
      const cacheKey = `gh_cache_${name}`;
      const cached = localStorage.getItem(cacheKey);

      // Return cached data if valid
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TIME) {
          console.log("Returning cached data for", url);
          return data;
        }
      }

      // Add proper headers to the fetch request
      const headers: Record<string, string> = GH_CONFIG.token
        ? {
            Authorization: `token ${GH_CONFIG.token}`,
            Accept: "application/vnd.github.v3+json",
          }
        : {};

      const response = await fetch(url);

      // Handle rate limits using GitHub's headers
      const remaining = parseInt(
        response.headers.get("x-ratelimit-remaining") || "0"
      );
      const resetTime =
        parseInt(response.headers.get("x-ratelimit-reset") || "0") * 1000;

      if (remaining === 0) {
        throw new Error(
          `Rate limit exceeded. Resets at ${new Date(
            resetTime
          ).toLocaleTimeString()}`
        );
      }

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Resource not found: ${url}`);
        }
        throw new Error(
          `GitHub API request failed. Status: ${response.status}`
        );
      }

      const data = await response.json();

      // Cache successful responses only
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );

      return data;
    } catch (error) {
      console.error("Fetch error:", error);
      // Return stale cache if available
      const cacheKey = `gh_cache_${btoa(url)}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached).data;
      throw error;
    }
  };

  // Add this cleanup function to remove expired cache entries
  const cleanCache = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("gh_cache_")) {
        const entry = localStorage.getItem(key);
        if (entry && Date.now() - JSON.parse(entry).timestamp > CACHE_TIME) {
          localStorage.removeItem(key);
        }
      }
    });
  };

  // Run cache cleanup on initial load
  cleanCache();

  // Fetch model directories
  useEffect(() => {
    const fetchModelDirectories = async () => {
      debugger;
      try {
        const url = `https://api.github.com/repos/${GH_CONFIG.owner}/${GH_CONFIG.repo}/contents/${GH_CONFIG.basePath}?ref=${GH_CONFIG.branch}`;

        // Use the githubFetch function to fetch the directories
        const directories = await githubFetch(url);

        // Filter and map the directories
        const modelDirs = directories
          .filter((dir: any) => dir.type === "dir")
          .map((dir: any) => dir.name);

        console.log("Fetched Model Directories:", modelDirs);

        // Update the state with the fetched directories
        setAvailableFiles(modelDirs);
      } catch (error) {
        console.error("Error fetching model directories:", error);
        setApiError(
          error instanceof Error
            ? error.message
            : "Failed to load model directories"
        );
      }
    };

    fetchModelDirectories();
  }, []);

  // Fetch model files
  useEffect(() => {
    const fetchModelFiles = async () => {
      debugger;
      if (availableFiles.length === 0) return;

      try {
        const filesPromises = availableFiles.map(async (modelDir) => {
          debugger;
          const url = `https://api.github.com/repos/${GH_CONFIG.owner}/${
            GH_CONFIG.repo
          }/contents/${GH_CONFIG.basePath}/${encodeURIComponent(
            modelDir
          )}?ref=${GH_CONFIG.branch}`;
          const files = await githubFetch(url);
          return files
            .filter((file: any) => file.name.endsWith(".json"))
            .map((file: any) => `${modelDir}/${file.name}`);
        });

        const allFiles = await Promise.all(filesPromises);
        console.log("Fetched Model Files:", allFiles);

        setAllFileNames(allFiles.flat());
      } catch (error) {
        setApiError(
          error instanceof Error ? error.message : "Failed to load model files"
        );
      }
    };
    fetchModelFiles();
  }, [availableFiles]);

  
  // Fetch model data and populate ComboBoxes
  useEffect(() => {
    const fetchModelContents = async () => {
      if (allFileNames.length === 0) return;
  
      setIsLoading(true);
      try {
        const fetchPromises = allFileNames.map(async (filePath) => {
          const url = `https://api.github.com/repos/${GH_CONFIG.owner}/${GH_CONFIG.repo}/contents/${GH_CONFIG.basePath}/${filePath}?ref=${GH_CONFIG.branch}`;
          const response = await githubFetch(url);
          const decodedContent = atob(response.content);
          const parsedContent = JSON.parse(decodedContent);
  
          console.log("Parsed Content:", parsedContent, filePath);
  
          // Flatten the nested structure and return the model data
          return Array.isArray(parsedContent[0])
            ? parsedContent[0]
            : [parsedContent];
        });
  
        const modelData = await Promise.all(fetchPromises);
  
        // Flatten the model data and filter valid models
        const allModels = modelData.flat().filter((model) => model?.name);
        console.log("All models:", allModels);

        // Get unique model names with case-insensitive check
        const uniqueModels = Array.from(
            new Set(availableFiles.map((model) => model.trim().toLowerCase()))
        ).filter(Boolean);

        // Separate granite and other models
        const graniteModelNames = uniqueModels
            .filter((name) => name.includes("granite"))
            .sort();

        const otherModelNames = uniqueModels
            .filter((name) => !name.includes("granite"))
            .sort();

        console.log("Granite Models:", graniteModelNames);
        console.log("Other Models:", otherModelNames);

        setGraniteModels(graniteModelNames);
        setOtherModels(otherModelNames);
  
        setModelsData(allModels);
      } catch (error) {
        console.error("Error fetching model content:", error);
        setApiError("Failed to load model content");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchModelContents();
  }, [allFileNames]);

  // Fetch code assist data
  useEffect(() => {
    const fetchCodeAssistData = async () => {
      try {
        if (!GH_CONFIG.token) {
          throw new Error(
            "GitHub token is not defined. Please set REACT_APP_GH_TOKEN in your .env file."
          );
        }

        const url = `https://raw.githubusercontent.com/${GH_CONFIG.owner}/${GH_CONFIG.repo}/${GH_CONFIG.branch}/code-assist-webUI/code-assist-web/src/code-assist-data.json`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch code-assist-data.json. Status: ${response.status}`
          );
        }

        // Parse the JSON content
        const data = await response.json();
        console.log("Fetched Code Assist Data:", data);

        const scores: { [key: string]: string } = {};

        // Process the data to calculate scores
        Object.values(data).forEach((modelGroup: any) => {
          if (Array.isArray(modelGroup)) {
            modelGroup.forEach((model: any) => {
              const validScores = model.Data.filter(
                (d: any) => d["Pass@1"] && d["Pass@1"] !== "Not applicable"
              ).map((d: any) => parseFloat(d["Pass@1"]));

              if (validScores.length > 0) {
                const average =
                  validScores.reduce((a: number, b: number) => a + b, 0) /
                  validScores.length;
                scores[model.Name] = `${Math.min(
                  Math.max(average * 100, 0),
                  100
                ).toFixed(1)}%`;
              }
            });
          } else {
            console.warn("Unexpected modelGroup format:", modelGroup);
          }
        });

        // Update the state with the fetched data
        setCodeAssistData(data);
        setModelScores(scores);
      } catch (error) {
        console.error("Error fetching code assist data:", error);
        setApiError("Failed to load code assist metrics");
      }
    };

    fetchCodeAssistData();
  }, []);

  // Add these utility functions
  const parseFileName = (fileName: string): ParsedFile | null => {
    const match = fileName.match(/^(.+?)_(\d{8}T\d{6})\.json$/);
    if (!match) return null;
    return {
      modelName: match[1],
      timestamp: match[2],
      fullName: fileName,
    };
  };

  const getModelBaseName = (fileName: string): string => {
    const parts = fileName.split("_");
    if (parts.length < 2) return fileName;
    return parts[0].split(":")[0].replace(/\d+\.\d+/g, "");
  };

  // Update your getModelDetails function
  const getModelDetails = (
    name: string
  ): { model: Model | undefined; modelJsonFiles: string[] } => {
    console.log("getModelDetails called with name:", name);
  
    // Parse file names to extract model details
    const modelJsonFiles = allFileNames
      .map((fileName) => parseFileName(fileName))
      .filter((file): file is ParsedFile => file !== null)
      .filter((file) => getModelBaseName(file.modelName) === name)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      .map((file) => file.fullName);
  
    console.log("Parsed modelJsonFiles:", modelJsonFiles);
  
    // Find the model data in modelsData
    const modelData = modelsData.find((m: Model) => m.name === name);
  
    console.log("Found modelData:", modelData);
  
    return { model: modelData, modelJsonFiles };
  };

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
    // Remove <user> and <assistant> tags from the prompt
    const cleanedPrompt = prompt.replace(/<\/?(user|assistant)>/g, "");
    const regex = /```(.*?)```/gs;
    let lastIndex = 0;
    const parts: React.ReactNode[] = [];

    cleanedPrompt.replace(regex, (match, codeBlock, offset) => {
      // Add text before code block
      parts.push(
        cleanedPrompt
          .slice(lastIndex, offset)
          .split("\n")
          .map((line, index) => (
            <React.Fragment key={`${offset}-text-${index}`}>
              {line}
              <br />
            </React.Fragment>
          ))
      );

      // Add code block
      parts.push(
        <code
          key={offset}
          style={{
            backgroundColor: "#101010",
            padding: "2px 10px",
            borderRadius: "4px",
            display: "block",
            wordBreak: "break-word",
            margin: "8px 0",
            overflowX: "auto",
            letterSpacing: "0.025em",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {codeBlock.split("\n").map((line: string, index: number) => (
            <React.Fragment key={`${offset}-code-${index}`}>
              <span>{line}</span>
              <br />
            </React.Fragment>
          ))}
        </code>
      );

      lastIndex = offset + match.length;
      return match;
    });

    // Add remaining text after last code block
    parts.push(
      cleanedPrompt
        .slice(lastIndex)
        .split("\n")
        .map((line, index) => (
          <React.Fragment key={`end-text-${index}`}>
            {line}
            <div></div>
          </React.Fragment>
        ))
    );

    return <>{parts}</>;
  };

  useEffect(() => {
    const fetchPromptResults = async () => {
      try {
        const url = `https://api.github.com/repos/${GH_CONFIG.owner}/${GH_CONFIG.repo}/contents/${GH_CONFIG.basePath}?ref=${GH_CONFIG.branch}`;
        const directories = await githubFetch(url);

        // Filter and map the directories
        const modelDirs = directories
          .filter((dir: any) => dir.type === "dir")
          .map((dir: any) => dir.name);

        console.log("Fetched Model Directories:", modelDirs);

        // Update the state with the fetched directories
        setAvailableFiles(modelDirs);
      } catch (error) {
        console.error("Error fetching prompt-results:", error);
        setApiError(
          error instanceof Error
            ? error.message
            : "Failed to load prompt-results"
        );
      }
    };

    fetchPromptResults();
  }, []);

  return (
    <div className="evaluation-comparison-wrap">
      <Grid fullWidth narrow className="page-content">
        <Column sm={4} md={8} lg={16}>
          <div className="heading-wrap">
            <h3>Select Models for Comparison</h3>
          </div>
        </Column>
        <Column sm={4} md={8} lg={16}>
          <div className="compare-option-wrap">
            {/* <RadioButtonGroup
                            legendText="Compare with:"
                            name="compare-option"
                            defaultSelected="other"
                            onChange={(value) => setCompareOption(value as string)}
                            disabled={isLoading}
                        >
                            <RadioButton labelText="Compare with Other AI Models" value="other" id="other-radio" />
                            <RadioButton labelText="Compare with Other Granite Models" value="granite" id="granite-radio" />
                        </RadioButtonGroup> */}
            <Grid narrow>
              <Column sm={4} md={4} lg={6}>
                <ComboBox
                  key={selectedGranite}
                  id="granite-model-combo-box"
                  items={[...graniteModels, ...otherModels]}
                  itemToString={(item) => (item ? item : "")}
                  onChange={({ selectedItem }) =>
                    setSelectedGranite(selectedItem as string)
                  }
                  selectedItem={selectedGranite}
                  titleText="Select First Model"
                  placeholder="Choose any model"
                  disabled={isLoading}
                  shouldFilterItem={({ item, inputValue }) =>
                    item.toLowerCase().includes(inputValue?.toLowerCase() || "")
                  }
                />
              </Column>
              <Column sm={4} md={4} lg={6}>
                <ComboBox
                  key={selectedOther}
                  id="other-model-combo-box"
                  items={[...graniteModels, ...otherModels]}
                  itemToString={(item) => (item ? item : "")}
                  onChange={({ selectedItem }) =>
                    setSelectedOther(selectedItem as string)
                  }
                  selectedItem={selectedOther}
                  titleText="Select Second Model"
                  placeholder="Choose any model"
                  disabled={isLoading}
                  shouldFilterItem={({ item, inputValue }) =>
                    item.toLowerCase().includes(inputValue?.toLowerCase() || "")
                  }
                />
              </Column>
              <Column sm={4} md={8} lg={4}>
                <div
                  style={{
                    marginTop: "1.6rem",
                    display: "flex",
                    gap: "0.8rem",
                  }}
                >
                  <Button
                    onClick={handleCompare}
                    disabled={!selectedGranite || !selectedOther || isLoading}
                  >
                    Compare
                  </Button>
                  <Button
                    onClick={handleClear}
                    kind="danger"
                    disabled={(!selectedGranite && !selectedOther) || isLoading}
                  >
                    Clear
                  </Button>
                </div>
              </Column>
            </Grid>
          </div>
        </Column>

        {isLoading && (
          <Column sm={4} md={8} lg={16}>
            <div
              className="skeleton-wrap"
              style={{
                display: "flex",
                width: "300px",
                height: "350px",
                alignItems: "center",
                justifyContent: "center",
                margin: "4rem auto 0rem",
              }}
            >
              <DatePickerSkeleton range />
            </div>
          </Column>
        )}

        {apiError && (
          <Column sm={4} md={8} lg={16}>
            <div
              style={{ color: "red", textAlign: "center", marginTop: "20px" }}
            >
              {apiError}
            </div>
          </Column>
        )}

        {apiError?.includes("rate limit") && (
          <Column sm={4} md={8} lg={16}>
            <div className="rate-limit-error">
              <h4>⚠️ API Rate Limit Exceeded</h4>
              {!GH_CONFIG.token ? (
                <>
                  <p>To increase your limits:</p>
                  <ol>
                    <li>
                      Create <code>.env.local</code> file
                    </li>
                    <li>
                      Add <code>REACT_APP_GH_TOKEN=your_github_token</code>
                    </li>
                    <li>Restart development server</li>
                  </ol>
                </>
              ) : (
                <p>
                  Even with authentication, GitHub's API limits have been
                  reached. Try again later.
                </p>
              )}
            </div>
          </Column>
        )}

        {compareClicked && selectedGranite && selectedOther && !isLoading ? (
          <Column sm={4} md={8} lg={16}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                marginTop: "20px",
              }}
            >
            {[selectedGranite, selectedOther].map((modelName, index) => {
                console.log("1.modelName:::>>", modelName);

                const model = getModelDetails(modelName);

                console.log("modelmodel::", model);

                if (!model) return null;

                const questionNumbers = ["All"];
                const selectedQuestion = model.model ? selectedQuestions[model.model.name] || "All" : "All";

                if (model && model.model) {
                    questionNumbers.push(...model.model.prompt.map((_, index) => `Question ${index + 1}`));
                }

                const filteredPrompts = model?.model?.prompt?.filter((prompt) => {
                    const modelName = model?.model?.name ?? '';
            
                    console.log("modelName:::", modelName, "modelJsonFiles", model?.modelJsonFiles);
            
                    if (!selectedDates[modelName]) {
                        return true;
                    }

                    const createdAtDate = model?.model?.created_at
                        ? new Date(
                            Number(model?.model?.created_at.substring(0, 4)),
                            Number(model?.model?.created_at.substring(4, 6)) - 1,
                            Number(model?.model?.created_at.substring(6, 8)),
                            Number(model?.model?.created_at.substring(9, 11)),
                            Number(model?.model?.created_at.substring(11, 13))
                        )
                        : null;

                    console.log(`filteredPrompts -- createdAtDate for ${model?.model?.name}:`, createdAtDate);

                    if (!createdAtDate || isNaN(createdAtDate.getTime())) return false;

                    const formattedDate = createdAtDate
                      .toLocaleDateString("en-GB")
                      .split("/")
                      .reverse()
                      .join("-");

                    console.log( `filteredPrompts -- formattedDate for ${model?.model?.name}:`, formattedDate, `selectedDates[modelName]:`, selectedDates[modelName]);

                    const getModelName = (): string | undefined => {
                      return model?.model?.name;
                    };

                    return (
                      formattedDate === selectedDates[getModelName() ?? ""]
                    );
                  }
                );

                console.log(`Model: ${model?.model?.name}, Selected Date: ${selectedDates[modelName]}`);
                console.log(`Prompts:`, model?.model?.prompt);
                console.log(`Filtered Prompts:`, filteredPrompts);

                return (
                  <div
                    id={`chat-outter-wrap-${model.model?.name}`}
                    className="chat-outter-wrap"
                    key={model?.model?.name || index} // Ensure a unique key
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h4 style={{ textTransform: "capitalize", marginBottom: "10px", marginTop: "0" }}>
                            {model?.model?.name}{" "}
                            {modelScores[selectedGranite] &&
                            modelScores[selectedOther] &&
                            parseFloat(modelScores[model?.model?.name ?? ""]) >
                                parseFloat(
                                    modelScores[
                                        selectedGranite === model?.model?.name
                                            ? selectedOther
                                            : selectedGranite
                                    ]
                                ) ? (
                                <span
                                    style={{
                                        fontSize: "0.8rem",
                                        padding: "0.4rem",
                                        color: "#069d37",
                                        borderRadius: "10rem",
                                    }}
                                >
                                    Recommended
                                </span>
                            ) : (
                                ""
                            )}
                        </h4>
                    </div>

                    <p>
                      <strong>Description:</strong> Currently No Description
                      Available.
                    </p>

                    <div className="score-wrapper">
                      <strong>Pass@1 Score</strong>
                      <Tag
                            className="score-capsule"
                            size="md"
                            type={
                                modelScores[selectedGranite] &&
                                modelScores[selectedOther] &&
                                parseFloat(modelScores[model?.model?.name ?? ""]) >
                                    parseFloat(
                                        modelScores[
                                            selectedGranite === model?.model?.name
                                                ? selectedOther
                                                : selectedGranite
                                        ]
                                    )
                                    ? "green"
                                    : "red"
                            }
                        >
                            {modelScores[model?.model?.name ?? ""] || "N/A"}
                        </Tag>
                    </div>

                    <div style={{ margin: "0.5rem 0" }}>
                      <Grid fullWidth narrow>
                        {/* <Column lg={8} md={8} sm={4}>
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
                        </Column> */}
                        <Column lg={8} md={8} sm={4}>
                          <Dropdown
                            id={`question-combo-box-${model?.model?.name}`}
                            className="question-combo-box"
                            items={questionNumbers}
                            itemToString={(item) => (item ? item : "")}
                            onChange={({ selectedItem }) =>
                              setSelectedQuestions((prev) => ({
                                ...prev,
                                [model?.model?.name || "default_key"]:
                                  selectedItem as string,
                              }))
                            }
                            selectedItem={selectedQuestion}
                            titleText="Select a Question"
                            label="Choose a question"
                          />
                        </Column>
                        <Column lg={8} md={8} sm={4}>
                          <ComboBox
                            id={`result-combo-box-${model?.model?.name}`}
                            className="result-combo-box"
                            items={model?.modelJsonFiles || []}
                            itemToString={(item) => {
                              if (!item) return "Select Result";
                              const parsed = parseFileName(item);
                              if (!parsed) return item;

                              // Format timestamp to DD-MM-YYYY HH:MM am/pm
                              const datePart = parsed.timestamp.substring(0, 8);
                              const timePart = parsed.timestamp.substring(9);
                              const year = datePart.substring(0, 4);
                              const month = datePart.substring(4, 6);
                              const day = datePart.substring(6, 8);

                              const hours = parseInt(timePart.substring(0, 2));
                              const minutes = timePart.substring(2, 4);
                              const ampm = hours >= 12 ? "pm" : "am";
                              const twelveHour = hours % 12 || 12;

                              return `${parsed.modelName}-${day}-${month}-${year} ${twelveHour}:${minutes}${ampm}`;
                            }}
                            onChange={({ selectedItem }) => {
                              const currentModelName = model?.model
                                ?.name as string;
                              setSelectedResults((prev) => ({
                                ...prev,
                                [currentModelName]: selectedItem as string,
                              }));
                            }}
                            selectedItem={
                              selectedResults[model?.model?.name as string] ||
                              null
                            }
                            titleText="Select a Result"
                            placeholder="Choose a result version"
                            shouldFilterItem={({ item, inputValue }) =>
                              item
                                .toLowerCase()
                                .includes(inputValue?.toLowerCase() || "")
                            }
                            disabled={!model?.modelJsonFiles?.length}
                          />
                          {/* <p id="result-warn-message" style={{ display: "block", color: "red", margin: "0.4rem 0", fontSize: "0.75rem" }}>Please select a result from dropdown.</p> */}
                        </Column>
                      </Grid>

                      <Grid fullWidth narrow>
                        {(selectedResults[model?.model?.name as string] ||
                          model?.modelJsonFiles?.length === 1) && (
                          <Column lg={16} md={8} sm={4}>
                            <Button
                              kind="danger--tertiary"
                              size="sm"
                              onClick={() => {
                                const modelName = model?.model?.name as string;
                                setSelectedQuestions((prev) => ({
                                  ...prev,
                                  [modelName]: "All",
                                }));
                                setSelectedResults((prev) => ({
                                  ...prev,
                                  [modelName]: "",
                                }));
                                setSelectedDates((prev) => ({
                                  ...prev,
                                  [modelName]: null,
                                }));
                              }}
                              disabled={
                                !selectedResults[
                                  model?.model?.name as string
                                ] &&
                                !selectedDates[model?.model?.name as string]
                              }
                              style={{
                                marginTop: "0.8rem",
                                padding: "0.5rem 1rem",
                                width: "10rem",
                                alignItems: "center",
                                justifyContent: "center",
                                float: "right",
                                display:
                                  !selectedResults[
                                    model?.model?.name as string
                                  ] &&
                                  !selectedDates[model?.model?.name as string]
                                    ? "none"
                                    : "block",
                              }}
                            >
                              Reset Filter
                            </Button>
                          </Column>
                        )}
                      </Grid>
                    </div>
                    <p>
                      <strong>Prompt:</strong>
                    </p>

                    <div>
                      <Checkbox
                        id={`solid-background-toggle-${model?.model?.name}`}
                        className="solid-background-toggle"
                        labelText="Remove Prompt Background Wallpaper"
                        checked={
                          model && model.model
                            ? solidBackgrounds[model.model.name] || false
                            : false
                        }
                        onChange={() => {
                          const modelName = model?.model?.name ?? "default";
                          setSolidBackgrounds((prev) => ({
                            ...prev,
                            [modelName]: !prev[modelName],
                          }));
                        }}
                        style={{ float: "right" }}
                      />
                    </div>

                    <div
                      className={
                        solidBackgrounds[model?.model?.name ?? "default"]
                          ? "chat-screen solid-bg"
                          : "chat-screen"
                      }
                    >
                      <div className="date-capsule-wrap">
                        <Tag className="date-capsule" type="warm-gray">
                          {selectedDates[model?.model?.name ?? "default"]
                            ? format(
                                new Date(
                                  selectedDates[
                                    model?.model?.name ?? "default"
                                  ] || ""
                                ),
                                "dd-MM-yyyy"
                              )
                            : "Today"}
                        </Tag>
                      </div>
                      {filteredPrompts && filteredPrompts.length === 0 ? (
                        <div
                          style={{
                            color: "#fff",
                            background: "#606060cc",
                            borderRadius: "4px",
                            padding: "0.7rem",
                            textAlign: "center",
                            marginTop: "20px",
                          }}
                        >
                          No results found. <br />
                          <br /> Please select another model or Click reset
                          filter button to see the latest prompt result.
                        </div>
                      ) : (
                        <ul>
                          {selectedQuestion === "All"
                            ? filteredPrompts &&
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
                            : filteredPrompts &&
                              filteredPrompts
                                .filter(
                                  (_, index) =>
                                    index ===
                                    parseInt(selectedQuestion.split(" ")[1]) - 1
                                )
                                .map((prompt, index) => (
                                  <li key={index}>
                                    <div className="user-message-bubble">
                                      <strong>User</strong>
                                      {formatPromptWithCodeTags(prompt.user)}
                                    </div>
                                    <div className="assistant-message-bubble">
                                      <strong>Assistant</strong>
                                      {formatPromptWithCodeTags(
                                        prompt.assistant
                                      )}
                                    </div>
                                  </li>
                                ))}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Column>
        ) : (
          <Column sm={4} md={8} lg={16}>
            {!isLoading && (
              <div
                style={{
                  color: "#fff",
                  background: "#262626",
                  border: "0.4px solid #514f4f",
                  borderRadius: "4px",
                  padding: "0.7rem",
                  textAlign: "center",
                  boxShadow: "0 0 6px 1px rgb(0 0 17)",
                  margin: "1.2rem auto",
                  width: "50%",
                }}
              >
                <p>
                  No comparison found. <br /> Please select models to compare.
                </p>
              </div>
            )}
          </Column>
        )}
      </Grid>
    </div>
  );
};

export default ModelComparison;
