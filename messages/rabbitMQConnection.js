const amqp = require("amqplib");
var channel, connection;

const connectQueue = async () => {
  try {
    connection = await amqp.connect("amqp://localhost:5672");
    channel = await connection.createChannel();

    await channel.assertQueue("test-queue");
    return channel;
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectQueue;
