import { useEffect, useState, useCallback } from "react";
import * as csv from "csvtojson";
import DataTable from "react-data-table-component";

const tableStyle = {
  headRow: {
    style: {
      background: "rgb(0, 191, 255)",
    }
  },
  rows: {
    style: {
      background: "rgb(220,220,220)"
    }
  }
}

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
    setThePair(max.split("-"));
  }, [pairs]);

  const calculatePairs = useCallback(() => {
    const today = new Date();
    const projects = [];
    data.forEach((pr) => {
      if (!projects.includes(pr.project_id)) projects.push(pr.project_id);
    });
    const calculatedPairs = [];
    projects.forEach((pr) => {
      const projectData = data.filter((d) => d.project_id === pr).sort((a, b) => a.employee_id > b.employee_id ? 1 : -1);
      projectData.forEach((pd, index) => {
        const emp1From = new Date(pd.date_from);
        const emp1To =
          pd.date_to === "NULL"
            ? new Date(today.setHours(0, 0, 0, 0))
            : new Date(pd.date_to);

        for (let i = index + 1; i < projectData.length; i++) {
          const emp2From = new Date(projectData[i].date_from);
          const emp2To =
            projectData[i].date_to === "NULL"
              ? new Date(today.setHours(0, 0, 0, 0))
              : new Date(projectData[i].date_to);
          if (emp1From > emp2To || emp1To < emp2From) return;
          const overlapStartDate = emp1From < emp2From ? emp2From : emp1From;
          const overlapEndDate = emp1To < emp2To ? emp1To : emp2To;
          const overlapDuration = Math.floor(
            (overlapEndDate - overlapStartDate) / (1000 * 60 * 60 * 24)
          );
          calculatedPairs.push({
            employeeId1: pd.employee_id,
            employeeId2: projectData[i].employee_id,
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
    if (!e.target.files.length > 0) return
    readCSVFile(e.target.files[0]);
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

      <section style={{ width: "60vw", marginLeft: "auto", marginRight: "auto", marginTop: "40px" }}>
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
              (p) => p.employeeId1 === thePair[0] && p.employeeId2 === thePair[1]
            )}
            customStyles={tableStyle}
          />
        )}
      </section>
    </div>
  );
};

export default MainPage;
