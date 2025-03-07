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
import { ArrowDown, ArrowDownLeft, ArrowLeft, ArrowRight, ArrowUp, Document, DocumentBlank } from "@carbon/react/icons";

interface BigCodeBenchData {
  id: string;
  model: string;
  complete_prompt: number;
  instruct_prompt: number;
  average: number;
  rank: number;
}

const EvaluationMetrics = () => {
  const [bigCodeBenchData, setBigCodeBenchData] = useState<BigCodeBenchData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isHardSet, setIsHardSet] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const itemsPerPage = 15;

  const fetchBigCodeBenchData = async (isHard: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const url = isHard
        ? "https://datasets-server.huggingface.co/rows?dataset=bigcode%2Fbigcodebench-hard-results&config=default&split=train&offset=0&length=100"
        : "https://datasets-server.huggingface.co/rows?dataset=bigcode%2Fbigcodebench-results&config=default&split=train&offset=0&length=100";
      
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
        .sort((a: { average: number; }, b: { average: number; }) => b.average - a.average)
        .map((item: any, index: number) => ({ ...item, rank: index + 1 }));

      console.log("Sorted Tasks with Rank:", tasks);
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
    { key: "rank", header: "Rank" },
    { key: "model", header: "Model" },
    { key: "average", header: "Pass@1 Score" },
    ...(showDetails ? [
      { key: "complete_prompt", header: "Complete" },
      { key: "instruct_prompt", header: "Instruct" }
    ] : [])
  ];

  const totalPages = Math.ceil(bigCodeBenchData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = bigCodeBenchData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="evaluation-metrics-wrap">
        <Grid fullWidth narrow className="page-content">
            <Column lg={16} md={8} sm={4}>
                <div className="heading-wrap">
                    <h3>BigCodeBench {isHardSet ? "Hard" : "Full"} Result</h3>
                    <div>
                        <Button onClick={() => setIsHardSet(!isHardSet)}>
                            Switch to {isHardSet ? "Full" : "Hard"}
                        </Button>
                        <Button kind="ghost" renderIcon={showDetails ? DocumentBlank : Document} onClick={() => setShowDetails(!showDetails)}>
                            {showDetails ? "Show Less" : "Show More"}
                        </Button>
                    </div>
                </div>
            </Column>
            <Column lg={16} md={8} sm={4}>
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
                            <TableRow key={row.id} className={row.cells[0].value <= 3 ? "top-rank" : ""}>
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
        </Grid>
    </div>
  );
};

export default EvaluationMetrics;
