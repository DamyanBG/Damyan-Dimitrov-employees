import { useEffect, useState, useCallback } from "react";
import * as csv from "csvtojson";
import DataTable from "react-data-table-component";

const Output = ({ thePair }) => (
  <section>
    <p>Output: {`${thePair[0]} ${thePair[1]} ${thePair[2]}`}</p>
  </section>
);

const tableStyle = {
  headRow: {
    style: {
      background: "rgb(0, 191, 255)",
    },
  },
  rows: {
    style: {
      background: "rgb(220,220,220)",
    },
  },
};

const MainPage = () => {
  const [thePair, setThePair] = useState(null);
  const [pairs, setPairs] = useState([]);
  const [data, setData] = useState(null);

  const findThePair = useCallback(() => {
    const pairsSummarize = {};
    pairs.forEach((pair) => {
      const key = `${pair.employeeId1}-${pair.employeeId2}`;
      if (!pairsSummarize[key]) {
        pairsSummarize[key] = 0;
      }
      pairsSummarize[key] += parseInt(pair.daysWorked);
    });
    const max = Object.keys(pairsSummarize).reduce((a, b) =>
      pairsSummarize[a] > pairsSummarize[b] ? a : b
    );
    setThePair([...max.split("-"), pairsSummarize[max]]);
  }, [pairs]);

  const calculatePairs = useCallback(() => {
    const today = new Date();
    const projects = [];
    data.forEach((pr) => {
      if (!projects.includes(pr.ProjectID)) projects.push(pr.ProjectID);
    });
    const calculatedPairs = [];
    projects.forEach((pr) => {
      const projectData = data
        .filter((d) => d.ProjectID === pr)
        .sort((a, b) => (a.EmpID > b.EmpID ? 1 : -1));
      projectData.forEach((pd, index) => {
        const emp1From = new Date(pd.DateFrom);
        const emp1To =
          pd.DateTo === "NULL"
            ? new Date(today.setHours(0, 0, 0, 0))
            : new Date(pd.DateTo);

        for (let i = index + 1; i < projectData.length; i++) {
          const emp2From = new Date(projectData[i].DateFrom);
          const emp2To =
            projectData[i].DateTo === "NULL"
              ? new Date(today.setHours(0, 0, 0, 0))
              : new Date(projectData[i].DateTo);
          if (emp1From > emp2To || emp1To < emp2From) return;
          const overlapStartDate = emp1From < emp2From ? emp2From : emp1From;
          const overlapEndDate = emp1To < emp2To ? emp1To : emp2To;
          const overlapDuration =
            Math.floor(
              (overlapEndDate - overlapStartDate) / (1000 * 60 * 60 * 24)
            ) + 1;
          calculatedPairs.push({
            employeeId1: pd.EmpID,
            employeeId2: projectData[i].EmpID,
            projectId: pr,
            daysWorked: overlapDuration,
          });
        }
      });
    });
    setPairs(calculatedPairs);
  }, [data]);

  useEffect(() => {
    if (!data) return;
    calculatePairs();
  }, [data, calculatePairs]);

  useEffect(() => {
    if (pairs.length < 1) return;
    findThePair();
  }, [pairs, findThePair]);

  const handleOnFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== "text/csv") return;
    readCSVFile(file);
  };

  const readCSVFile = (file) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      const csvString = reader.result;
      csv()
        .fromString(csvString)
        .then((json) => setData(json));
    };
  };

  return (
    <div>
      <h3>Upload your CSV file</h3>
      <input type="file" accept=".csv" onChange={handleOnFileUpload} />

      {thePair && <Output thePair={thePair} />}

      <section style={{ width: "60vw", margin: "40px auto 60px auto" }}>
        {thePair && pairs.length > 0 && (
          <DataTable
            columns={[
              {
                name: "Employee ID #1",
                cell: (row) => row.employeeId1,
              },
              {
                name: "Employee ID #2",
                cell: (row) => row.employeeId2,
              },
              {
                name: "Project ID",
                cell: (row) => row.projectId,
              },
              {
                name: "Days worked",
                cell: (row) => row.daysWorked,
              },
            ]}
            data={pairs.filter(
              (p) =>
                p.employeeId1 === thePair[0] && p.employeeId2 === thePair[1]
            )}
            customStyles={tableStyle}
            pagination
          />
        )}
      </section>
    </div>
  );
};

export default MainPage;
