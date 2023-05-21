const express = require("express");
const app = express();
const port = 3001;

const connectQueue = require("./rabbitMQConnection.js");

const processSubmission = async () => {
  const channel = await connectQueue();

  console.log("Waiting for submissions...");

  channel.consume("test-queue", (message) => {
    const submission = JSON.parse(message.content.toString());
    // Process the submission here.
    console.log(`Received: ${submission}`);
    console.log(`${Buffer.from(message.content)}`);

    channel.ack(message);
  });
};
app.get("/", (req, res) => {
  res.send("Hello World Consumer App");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  processSubmission();
});
