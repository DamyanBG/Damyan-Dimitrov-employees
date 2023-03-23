import { useEffect, useState } from "react";
import * as csv from "csvtojson";

const MainPage = () => {
  const [pairs, setPairs] = useState([{}]);
  const [data, setData] = useState(null);

  const calculatePairs = () => {
    const today = new Date();
    console.table(data)
    const projects = []
    data.forEach((pr) => {
      if (!projects.includes(pr.project_id)) projects.push(pr.project_id)
    })
    const calculatedPairs = []
    projects.forEach((pr) => {
      const projectData = data.filter((d) => d.project_id === pr)
      projectData.forEach((pd, index) => {
        const emp1From = new Date(pd.date_from)
        const emp1To = pd.date_to === 'NULL' ? new Date(today.setHours(0,0,0,0)) : new Date(pd.date_to)
        
        for (let i = index + 1; i < projectData.length; i++) {
          const emp2From = new Date(projectData[i].date_from)
          const emp2To = projectData[i].date_to === 'NULL' ? new Date(today.setHours(0,0,0,0)) : new Date(projectData[i].date_to)
          if (emp1From > emp2To || emp1To < emp2From) return
          const overlapStartDate = emp1From < emp2From ? emp2From : emp1From
          const overlapEndDate = emp1To < emp2To ? emp1To : emp2To
          const overlapDuration = Math.floor((overlapEndDate - overlapStartDate) / (1000 * 60 * 60 * 24))
          calculatedPairs.push({
            employeeId1: pd.employee_id,
            employeeId2: projectData[i].employee_id,
            projectId: pr,
            daysWorked: overlapDuration
          })
        }
      })
    })
    setPairs(calculatedPairs)
  }

  useEffect(() => {
    if (!data) return
    calculatePairs()
  }, [data])

  const handleOnFileUpload = (e) => {
    readCSVFile(e.target.files[0])
  };

  const readCSVFile = (file) => {
    const reader = new FileReader()
    reader.readAsText(file)
    reader.onload = () => {
      const csvString = reader.result
      csv().fromString(csvString).then((json) => setData(json))
    }
  }

  return (
    <div>
      <h3>Upload your CSV file</h3>
      <input type="file" accept=".csv" onChange={handleOnFileUpload} />

      <table style={{ marginLeft: "auto", marginRight: "auto" }}>
        <thead>
          <tr>
            <th>Employee ID #1</th>
            <th>Employee ID #2</th>
            <th>Project ID</th>
            <th>Days worked</th>
          </tr>
        </thead>
        <tbody>
          {pairs.map((p) => (
            <tr key={`key-${p.projectId}-${p.employeeId1}-${p.employeeId2}`}>
              <td>{p.employeeId1}</td>
              <td>{p.employeeId2}</td>
              <td>{p.projectId}</td>
              <td>{p.daysWorked}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MainPage;
