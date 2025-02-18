import React from "react";
import { ScatterChart } from "@carbon/charts-react";
import { ScaleTypes } from "@carbon/charts";
import "@carbon/charts/styles.css";
import './_PassGraph.scss';
import codeAssistData from "../../code-assist-data.json";

interface ChartDataItem {
  group: string;
  x: string;  // Model name
  y: number;  // Pass@1 score in percentage
}

interface PassGraphState {
  data: ChartDataItem[];
  options: {
    title: string;
    theme: string;
    axes: {
      bottom: {
        title: string;
        mapsTo: string;
        scaleType: ScaleTypes;
      };
      left: {
        title: string;
        mapsTo: string;
        scaleType: ScaleTypes;
      };
    };
    height: string;
  };
}

class PassGraph extends React.Component<{}, PassGraphState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      data: [],
      options: {
        title: "Pass@1 Scores Comparison",
        theme: "g100",
        axes: {
          bottom: {
            title: "Model Name",
            mapsTo: "x",
            scaleType: ScaleTypes.LABELS, // Only model names as labels
          },
          left: {
            title: "Pass@1 Score (%)",
            mapsTo: "y",
            scaleType: ScaleTypes.LINEAR,
          },
        },
        height: "600px",
      },
    };
  }

  componentDidMount() {
    const aggregatedData: Record<string, { totalScore: number; count: number }> = {};

    Object.values(codeAssistData).forEach((models: any) => {
      models.forEach((model: any) => {
        const modelName = model.Name;
        if (!aggregatedData[modelName]) {
          aggregatedData[modelName] = { totalScore: 0, count: 0 };
        }

        model.Data.forEach((method: any) => {
          const passAt1 = method["Pass@1"];
          if (passAt1 !== "Not applicable" && passAt1 !== undefined) {
            let score = parseFloat(passAt1) * 100; // Convert from decimal to percentage
            aggregatedData[modelName].totalScore += score;
            aggregatedData[modelName].count += 1;
          }
        });
      });
    });

    // Convert aggregated data to an array for the graph
    const chartData: ChartDataItem[] = Object.entries(aggregatedData).map(([name, { totalScore, count }]) => {
      let avgScore = count > 0 ? totalScore / count : 0; // Compute average
      avgScore = Math.min(avgScore, 100); // Ensure max is 100%

      // Convert to 3 decimal places and round properly
      let formattedScore = avgScore.toFixed(4);
      let lastDigit = parseInt(formattedScore.charAt(formattedScore.length - 1));

      if (lastDigit >= 5) {
        formattedScore = (Math.round(avgScore * 1000) / 1000).toFixed(3);
      } else {
        formattedScore = formattedScore.slice(0, -1); // Keep 3 decimals
      }

      return {
        group: name,
        x: name, // Only show model name on x-axis
        y: parseFloat(formattedScore), // Final score in percentage
      };
    });

    this.setState({ data: chartData });
  }

  render() {
    return (
      <div className="pass-graph-wrap">
        <ScatterChart data={this.state.data} options={this.state.options} />
      </div>
    );
  }
}

export default PassGraph;
