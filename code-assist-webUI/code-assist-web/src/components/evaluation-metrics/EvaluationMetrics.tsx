import React, { useEffect, useState } from "react";
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Pagination,
  Grid,
  Column,
  Loading,
  UnorderedList,
  ListItem,
  Button,
} from "@carbon/react";
import "@carbon/charts/styles.css";
import "./_EvaluationMetrics.scss";

interface BigCodeBenchData {
  id: string;
  model: string;
  complete_prompt: number;
  instruct_prompt: number;
  average: number;
}

const EvaluationMetrics = () => {
  const [bigCodeBenchData, setBigCodeBenchData] = useState<BigCodeBenchData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isHardSet, setIsHardSet] = useState(false);
  const itemsPerPage = 15;

  const fetchBigCodeBenchData = async (isHard: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const url = isHard
        ? "https://datasets-server.huggingface.co/rows?dataset=bigcode%2Fbigcodebench-results&config=default&split=train&offset=0&length=100"
        : "https://datasets-server.huggingface.co/rows?dataset=bigcode%2Fbigcodebench-hard-results&config=default&split=train&offset=0&length=100";
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      const jsonData = await response.json();
      console.log("Fetched Data JSON", jsonData);

      const tasks = jsonData.rows
        .map((row: any, index: number) => ({
          id: `task-${index}`,
          model: row.row.model || "Unknown",
          complete_prompt: row.row.complete ?? 0,
          instruct_prompt: row.row.instruct ?? 0,
          average: ((row.row.complete ?? 0) + (row.row.instruct ?? 0)) / 2,
        }))
        .sort((a: { complete_prompt: number; }, b: { complete_prompt: number; }) => b.complete_prompt - a.complete_prompt);

      console.log("Sorted Tasks:", tasks);
      setBigCodeBenchData(tasks);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBigCodeBenchData(isHardSet);
  }, [isHardSet]);

  if (loading) return (
    <div className="evaluation-metrics-wrap">
        <Grid fullWidth narrow className="page-content">
            <Column lg={16}><Loading description="Loading.." /> </Column>
        </Grid>
    </div>
  );
  if (error) return (
    <Grid fullWidth narrow className="page-content">
        <Column lg={16}><p style={{ color: "red", padding: "3rem 0 0 3rem" }}>Error fetching data: {error}</p></Column>
    </Grid>
  );

  const headers = [
    { key: "model", header: "Model" },
    { key: "complete_prompt", header: "Complete" },
    { key: "instruct_prompt", header: "Instruct" },
    { key: "average", header: "Pass@1 Score" },
  ];

  // Pagination logic
  const totalPages = Math.ceil(bigCodeBenchData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = bigCodeBenchData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="evaluation-metrics-wrap">
        <Grid fullWidth narrow className="page-content">
            <Column lg={16}>
                <div className="heading-wrap">
                    <h3>BigCodeBench {isHardSet ? "Full" : "Hard"} Result</h3>
                    <Button onClick={() => setIsHardSet(!isHardSet)}>
                        Switch to {isHardSet ? "Hard" : "Full"}
                    </Button>
                </div>
            </Column>
            <Column lg={16}>
                <DataTable rows={paginatedData} headers={headers}>
                    {({ rows, headers, getHeaderProps }) => (
                    <>
                        <Table>
                        <TableHead>
                            <TableRow>
                            {headers.map((header) => (
                                <TableHeader {...getHeaderProps({ header })}>
                                {header.header}
                                </TableHeader>
                            ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row) => (
                            <TableRow key={row.id}>
                                {row.cells.map((cell) => (
                                <TableCell key={cell.id}>{cell.value}</TableCell>
                                ))}
                            </TableRow>
                            ))}
                        </TableBody>
                        </Table>

                        <Pagination
                        totalItems={bigCodeBenchData.length}
                        pageSize={itemsPerPage}
                        pageSizes={[15]}
                        onChange={({ page }) => setCurrentPage(page)}
                        page={currentPage}
                        />
                    </>
                    )}
                </DataTable>
            </Column>

            {/* <Column lg={16}> */}
                {/* iframe view of huggingface.co bigcodebench results */}
                {/* <iframe
                    src="https://huggingface.co/datasets/bigcode/bigcodebench-results/embed/viewer/default/train"
                    width="100%"
                    height="560px"
                ></iframe> */}
            {/* </Column> */}
            <Column lg={16}>
                <UnorderedList className="information-wrap">
                    <ListItem>
                        <h5>Note:</h5>
                        <UnorderedList nested>
                            <ListItem>
                                <p>Hard Set vs Full Set:</p>
                                <UnorderedList nested>
                                    <ListItem>
                                        <p><strong>Hard Set:</strong> A subset of ~150 BigCodeBench tasks which is more user-facing and challenging.</p>
                                    </ListItem>
                                    <ListItem>
                                        <p><strong>Full Set:</strong> The full set of 1140 BigCodeBench tasks.</p>
                                    </ListItem>
                                </UnorderedList>
                            </ListItem>
                        </UnorderedList>
                        <UnorderedList nested>
                            <ListItem>
                                <p>Complete vs Instruct:</p>
                                <UnorderedList nested>
                                    <ListItem>
                                        <p><strong>Complete :</strong> Code Completion based on the (verbose) structured docstring. This split tests if the models are good at coding.</p>
                                    </ListItem>
                                    <ListItem>
                                        <p><strong>Instruct :</strong> Code Generation based on the (less verbose) NL-oriented instructions. This split tests if the models are really capable enough to understand human intents to code.</p>
                                    </ListItem>
                                </UnorderedList>
                            </ListItem>
                            <ListItem>
                                <p>Complete and Instruct represent the calibrated Pass@1 score on the BigCodeBench benchmark splits.</p>
                            </ListItem>
                        </UnorderedList>
                    </ListItem>
                </UnorderedList>
            </Column>
        </Grid>
    </div>
  );
};

export default EvaluationMetrics;
