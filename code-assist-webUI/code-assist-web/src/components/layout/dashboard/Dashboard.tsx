import React from 'react';
import "./_Dashboard.scss";
import { Column, Grid } from '@carbon/react';
import PassGraph from '../../pass-graph/PassGraph';
import PassMethodList from '../../pass-method-list/PassMethodList';
// import EvaluationMetrics from '../../evaluation-metrics/EvaluationMetrics';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      {/* <div className="main-heading">
        <h1>Dashboard</h1>
      </div> */}
      
      <div className="dashboard-content">
        <Grid fullWidth narrow className="page-content">
            <Column lg={16}>
                <PassGraph />
            </Column>
            <Column lg={16}>
                <PassMethodList />
            </Column>
            {/* <Column lg={16}>
                <EvaluationMetrics />
            </Column> */}
        </Grid>
      </div>
    </div>
  );
};

export default Dashboard;