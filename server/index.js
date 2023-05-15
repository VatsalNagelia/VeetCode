const express = require("express");
const app = express();
const port = 3000;
var jwt = require("jsonwebtoken");
const { auth } = require("./middleware.js");
const Docker = require("dockerode");
const docker = new Docker();
let USER_ID_COUNTER = 1;
const JWT_SECRET = "secretJwt";
const bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const cors = require("cors");
app.use(cors());
app.use(jsonParser);
const SUBMISSIONS = [];
const USERS = [];
const PROBLEMS = [
  {
    problemId: "1",
    title: "201. Bitwise AND of Numbers Range",
    difficulty: "Medium",
    acceptance: "42%",
    description:
      "Given two integers left and right that represent the range [left, right], return the bitwise AND of all numbers in this range, inclusive.",
    exampleIn: "left = 5, right = 7",
    exampleOut: "4",
  },
  {
    problemId: "2",
    title: "205. Add two numbers",
    difficulty: "Medium",
    acceptance: "41%",
    description:
      "Given two numbers, add them and return them in integer range. use MOD=1e9+7",
    exampleIn: "a = 100 , b = 200",
    exampleOut: "300",
  },
  {
    problemId: "3",
    title: "202. Happy Number",
    difficulty: "Easy",
    acceptance: "54.9%",
    description: "Write an algorithm to determine if a number n is happy.",
    exampleIn: "n = 19",
    exampleOut: "true",
  },
  {
    problemId: "4",
    title: "203. Remove Linked List Elements",
    difficulty: "Hard",
    acceptance: "42%",
    description: "Given number k , removed kth element",
    exampleIn: "list: 1->2->3 , k=2",
    exampleOut: "1->3",
  },
  {
    problemId: "5",
    title: "201. Bitwise AND of Numbers Range",
    difficulty: "Medium",
    acceptance: "42%",
    description:
      "Given two integers left and right that represent the range [left, right], return the bitwise AND of all numbers in this range, inclusive.",
    exampleIn: "left = 5, right = 7",
    exampleOut: "4",
  },
  {
    problemId: "6",
    title: "205. Add two numbers",
    difficulty: "Medium",
    acceptance: "41%",
    description:
      "Given two numbers, add them and return them in integer range. use MOD=1e9+7",
    exampleIn: "a = 100 , b = 200",
    exampleOut: "300",
  },
  {
    problemId: "7",
    title: "202. Happy Number",
    difficulty: "Easy",
    acceptance: "54.9%",
    description: "Write an algorithm to determine if a number n is happy.",
    exampleIn: "n = 19",
    exampleOut: "true",
  },
  {
    problemId: "8",
    title: "203. Remove Linked List Elements",
    difficulty: "Hard",
    acceptance: "42%",
    description: "Given number k , removed kth element",
    exampleIn: "list: 1->2->3 , k=2",
    exampleOut: "1->3",
  },
];

app.get("/", (req, res) => {
  res.json({
    msg: "Hello World",
  });
});

app.get("/problems", (req, res) => {
  const filteredProblems = PROBLEMS.map((x) => ({
    problemId: x.problemId,
    difficulty: x.difficulty,
    acceptance: x.acceptance,
    title: x.title,
  }));
  res.json({
    problems: filteredProblems,
  });
});

app.get("/problems/:id", (req, res) => {
  const id = req.params.id;
  const problem = PROBLEMS.find((x) => x.problemId == id);
  if (!problem) {
    return res.status(411).json({});
  }
  res.json({
    problem,
  });
});

app.get("/me", auth, (req, res) => {
  const user = USERS.find((x) => x.id === req.userId);
  res.json({
    user,
  });
});

app.get("/submission/:problemId", auth, (req, res) => {
  const problemId = req.params.problemId;
  const userId = req.userId;
  const submissions = SUBMISSIONS.filter(
    (x) => x.problemId === problemId && x.userId === userId
  );
  res.json({
    submissions,
  });
});

app.post("/submission", auth, async (req, res) => {
  const problemId = req.body.problemId;
  const submission = req.body.submission;

  // You should define the test cases and expected results for each problem
  const testCases = getTestCasesForProblem(problemId);

  const isCorrect = await runCppCode(submission, testCases);

  if (isCorrect) {
    SUBMISSIONS.push({
      submission,
      problemId,
      userId: req.userId,
      status: "AC",
    });
    return res.json({
      status: "AC",
    });
  } else {
    SUBMISSIONS.push({
      submission,
      problemId,
      userId: req.userId,
      status: "WA",
    });
    return res.json({
      status: "WA",
    });
  }
});

async function runCppCode(code, testCases) {
  // Create a temporary directory to store the submitted code and test cases
  // You can use the 'tmp' library (https://www.npmjs.com/package/tmp) to create temporary directories

  // Write the submitted code to a .cpp file in the temporary directory

  // Write the test cases to a separate file in the temporary directory

  // Run the Docker container, mounting the temporary directory to /usr/src/app
  const container = await docker.createContainer({
    Image: "cpp-runner",
    Cmd: [
      "/bin/bash",
      "-c",
      "g++ -o solution solution.cpp && ./solution < input.txt > output.txt",
    ],
    Binds: ["/path/to/temporary/directory:/usr/src/app"],
  });

  await container.start();

  // Wait for the container to finish executing
  await new Promise((resolve) => container.once("stop", resolve));

  // Read the output.txt file from the temporary directory and compare it with the expected results

  // Return the evaluation result (AC or WA)

  // Clean up the temporary directory and remove the container
  await container.remove();

  // ... (previous steps of runCppCode function)

  // Read the output.txt file from the temporary directory
  const output = fs.readFileSync(
    "/path/to/temporary/directory/output.txt",
    "utf8"
  );

  // Compare the output with the expected results
  const isCorrect = testCases.every(({ input, expectedOutput }) => {
    // Execute the code with the input and compare the result with the expected output
    // You can use a function like `runSingleTestCase` to execute the code with the input
    const result = runSingleTestCase(code, input);
    return result === expectedOutput;
  });

  // Return the evaluation result (true for AC, false for WA)

  // ... (clean up the temporary directory and remove the container)

  return isCorrect;
}

function getTestCasesForProblem(problemId) {
  // Define test cases and expected results for each problem
  // Example:
  // {
  //   "1": [
  //     { input: "5 7\n", expectedOutput: "4\n" },
  //     { input: "10 12\n", expectedOutput: "8\n" }
  //   ],
  //   "2": [
  //     { input: "100 200\n", expectedOutput: "300\n" },
  //     { input: "500 700\n", expectedOutput: "1200\n" }
  //   ]
  // }
  const problemTestCases = {
    // ... test cases for each problem
  };

  return problemTestCases[problemId] || [];
}

app.post("/signup", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email.length < 1) {
    return res.status(403).json({ msg: "Incorrect Email" });
  }
  console.log(`received email ${email}`);
  if (USERS.find((x) => x.email === email)) {
    return res.status(403).json({ msg: "Email already exists" });
  }

  USERS.push({
    email,
    password,
    id: USER_ID_COUNTER++,
  });

  return res.json({
    msg: "Success",
  });
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = USERS.find((x) => x.email === email);
  if (!user) {
    return res.status(403).json({ msg: "User not found" });
  }

  if (user.password !== password) {
    return res.status(403).json({ msg: "Incorrect password" });
  }

  const token = jwt.sign(
    {
      id: user.id,
    },
    JWT_SECRET
  );

  return res.json({
    token,
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
