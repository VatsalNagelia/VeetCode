import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import "./ProblemsPage.css"


const ProblemsPage = ({ problems }) => {
  const [CodeSeg, setCodeSeg] = useState("");
  const { pid } = useParams();
  const cleanId = pid.substring(1);
  const [problem, setProblem] = useState(null);
  const [submission, setSubmission] = useState("");
  const [userSubmission, setUserSubmission] = useState(null)


  const init = async () => {
    const response = await fetch("http://localhost:3000/problems/" + cleanId, {
      method: "GET",
    })
    const json = await response.json()
    setProblem(json.problem)
  }

  const fetchSubmission = async () => {
    const token = localStorage.getItem("token")
    if (token) {
      const response = await fetch("http://localhost:3000/submission/" + cleanId, {
        method: "GET",
        headers: {
          "authorization": token
        }
      })
      const json = await response.json()
      setUserSubmission(json.submissions)
      console.log(json.submissions)
    }
  }

  useEffect(() => {
    init();
    fetchSubmission();
  }, [])

  const handleKey = (event) => {
    if (event.key == "Tab") {
      event.preventDefault();
      const { selectionStart, selectionEnd, value } = event.target;
      const val = value.substring(0, selectionStart) + "\t" + value.substring(selectionStart);
      event.target.value = val;
      event.target.selectionStart = event.target.selectionEnd = selectionStart + 1;
    }
    setCodeSeg(event.value);
  }

  return (
    <div>

      {
        problem ? (
          <div id="problempage" className='flex-row'>
            <div className="ques">
              <h1>{problem.title}</h1>
              <h5>Description</h5>
              <p>{problem.description}</p>
              <code>Input : {problem.exampleIn}</code>
              <code>Output : {problem.exampleOut}</code>
            </div>
            <div className="code">
              <h1>Code Here</h1>
              <div className='code-form'>
                <textarea name="SolvedCode" value={submission} onChange={(e) => { setSubmission(e.target.value) }} onKeyDown={(event) => handleKey(event)}></textarea>
                <button type="submit" id="submit" onClick={async (e) => {
                  const response = await fetch("http://localhost:3000/submission", {
                    method: "POST",
                    headers: {
                      'Content-Type': 'application/json',
                      'authorization': localStorage.getItem("token"),
                    },
                    body: JSON.stringify({
                      "problemId": cleanId,
                      "submission": submission,
                    })
                  })
                  const json = await response.json()
                  console.log(json)
                }}>SubmitCode</button>
              </div>
            </div>
            {
              localStorage.getItem("token") && userSubmission &&
              <div>
                <h1>Your Submissions</h1>
                {userSubmission.map((sub, i) => {
                  return (
                    <div key={i}>
                      <p>Submission {i + 1} (Status:{sub.status})</p>
                    </div>
                  )
                })}
              </div>
            }
          </div>
        ) :
          (<div>The searched Question Doesn't exist</div>)
      }

    </div >

  )
}

export default ProblemsPage