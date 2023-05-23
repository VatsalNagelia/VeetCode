const amqp = require("amqplib/callback_api");
const Docker = require("dockerode");
const fs = require("fs");
const docker = new Docker();

amqp.connect("amqp://localhost", function (err, conn) {
  conn.createChannel(function (err, ch) {
    const q = "submissions";

    ch.assertQueue(q, { durable: true });
    ch.prefetch(1);
    ch.consume(
      q,
      function (msg) {
        const { submission, problemId, userId } = JSON.parse(
          msg.content.toString()
        );

        fs.writeFileSync("solution.cpp", submission);

        docker.run(
          "c++_env",
          ["g++", "-o", "solution", "solution.cpp", "&&", "./solution"],
          process.stdout,
          function (err, data, container) {
            // Process the result here and update the database
          }
        );
      },
      { noAck: true }
    );
  });
});
