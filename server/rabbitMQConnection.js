const amqp = require("amqplib");
var channel, connection;

const connectQueue = async () => {
  try {
    connection = await amqp.connect("amqp://localhost:5672");
    channel = await connection.createChannel();

    await channel.assertQueue("test-queue");
  } catch (error) {
    console.log(error);
  }
};

const sendData = async (data) => {
  await channel.sendToQueue("test-queue", Buffer.from(JSON.stringify(data)));

  await channel.close();
  await connection.close();
};

module.exports = { connectQueue, sendData };
