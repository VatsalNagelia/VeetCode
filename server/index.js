const express = require("express");
const app = express();
const port = 3000;
var jwt = require("jsonwebtoken");
const { auth } = require("./middleware.js");
let USER_ID_COUNTER = 1;
const JWT_SECRET = "secretJwt";
const bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const cors = require("cors");
const amqp = require("amqplib/callback_api");
const pgp = require("pg-promise")();
const db = pgp("postgres://vatsal:admin@localhost:5432/coding_test");
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

app.post("/submission", auth, (req, res) => {
  const isCorrect = Math.random() < 0.5;
  const problemId = req.body.problemId;
  const submission = req.body.submission;
  const userId = req.userId;

  amqp.connect("amqp://localhost", function (err, conn) {
    conn.createChannel(function (err, ch) {
      const q = "submissions";
      const msg = JSON.stringify({ submission, problemId, userId });

      ch.assertQueue(q, { durable: true });
      ch.sendToQueue(q, Buffer.from(msg), { persistent: true });
    });
  });
  if (isCorrect) {
    SUBMISSIONS.push({
      submission,
      problemId,
      userId: req.userId,
      status: "AC",
    });
    return res.json({
      received: "yes",
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
      received: "yes",
      status: "WA",
    });
  }
});
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
