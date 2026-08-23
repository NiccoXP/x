require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// 1. Connect MongoDB
const ATLAS_URI = process.env.ATLAS_URI;
mongoose.connect(ATLAS_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// 2. MongoDB Schema for Map Structures
const StructureSchema = new mongoose.Schema({
  gridX: Number,
  gridZ: Number,
  type: String,
  ownerId: String,
  createdAt: { type: Date, default: Date.now }
});
const Structure = mongoose.model('Structure', StructureSchema);

// 3. Socket.io Real-Time Game State
io.on('connection', async (socket) => {
  console.log(`Player Connected: ${socket.id}`);

  // Send initial map state to newly connected player
  try {
    const existingStructures = await Structure.find({});
    socket.emit('initMapState', existingStructures);
  } catch (err) {
    console.error(err);
  }

  // Handle building construction request
  socket.on('requestBuild', async (data) => {
    const { gridX, gridZ, type } = data;

    // Check if slot is occupied
    const occupied = await Structure.findOne({ gridX, gridZ });
    if (occupied) {
      socket.emit('errorMsg', 'Tile occupied!');
      return;
    }

    // Save structure in DB
    const newStructure = new Structure({
      gridX,
      gridZ,
      type: type || 'hall',
      ownerId: socket.id
    });
    await newStructure.save();

    // Broadcast construction to ALL connected players
    io.emit('structurePlaced', newStructure);
  });

  socket.on('disconnect', () => {
    console.log(`Player Disconnected: ${socket.id}`);
  });
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
