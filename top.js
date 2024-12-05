require('dotenv').config(); 
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Kafka } = require('kafkajs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const kafka = new Kafka({ brokers: [process.env.KAFKA_BROKER || 'localhost:9092'] });
const consumer = kafka.consumer({ groupId: 'analytics-group' });

const visitCounts = {};

const updateTop10 = () => {
  const sortedShows = Object.entries(visitCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 10);
  io.emit('update-top10', sortedShows);
};

const startKafkaConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: process.env.KAFKA_TOPIC || 'movie-selections', fromBeginning: true });

  consumer.run({
    eachMessage: async ({ message }) => {
      const { movieId } = JSON.parse(message.value.toString());
      visitCounts[movieId] = (visitCounts[movieId] || 0) + 1;
      updateTop10();
    },
  });
};


io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');
  socket.emit('update-top10', Object.entries(visitCounts));
});

// Servir frontend desde /public
app.use(express.static('public'));

server.listen(process.env.PORT || 4000, async () => {
  console.log(`Servidor corriendo en http://localhost:${process.env.PORT || 4000}`);
  await startKafkaConsumer();
});
