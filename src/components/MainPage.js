import { useEffect, useState } from "react";

const MainPage = () => {
  const [pairs, setPairs] = useState([{}]);
  const [data, setData] = useState(null);

  const calculatePairs = () => {
    console.table(data)
    
  }

  useEffect(() => {
    if (!data) return
    calculatePairs()
  }, [data])

  const handleOnFileUpload = (e) => {
    const fileData = readCSVFile(e.target.files[0])
    calculatePairs(fileData)
  };

  const readCSVFile = (file) => {
    const reader = new FileReader()
    reader.readAsText(file)
    
    reader.onload = (event) => {
        const csvData = event.target.result
        const dataRows = csvData.split("\n")
        const formatted = []
        dataRows.forEach((row) => {
            const cells = row.split(",")
            if (cells[0] === '"employee_id"' || cells[0] === "") return
            formatted.push({
                employeeId: cells[0],
                projectId: cells[1],
                dateFrom: cells[2].slice(1, -1),
                dateTo: cells[3].slice(1, -2)
            })
        })
        setData(formatted)
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
