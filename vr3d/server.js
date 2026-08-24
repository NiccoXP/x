require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');
const PF = require('pathfinding');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const MAP_SIZE = 12;

// Serve public static assets
app.use(express.static(path.join(__dirname, 'public')));

// -------------------------------------------------------------
// 1. MONGODB ATLAS CONNECTION & SCHEMAS
// -------------------------------------------------------------
const ATLAS_URI = process.env.ATLAS_URI;

mongoose.connect(ATLAS_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB Atlas Connection Error:', err));

const UserSchema = new mongoose.Schema({
  username: String,
  wood: { type: Number, default: 500 },
  gold: { type: Number, default: 200 }
});
const User = mongoose.model('User', UserSchema);

const StructureSchema = new mongoose.Schema({
  gridX: Number,
  gridZ: Number,
  type: String,
  ownerId: String,
  isUnderConstruction: { type: Boolean, default: false },
  completesAt: Date
});
const Structure = mongoose.model('Structure', StructureSchema);

// -------------------------------------------------------------
// 2. PATHFINDING GRID INITIALIZATION
// -------------------------------------------------------------
const pathGrid = new PF.Grid(MAP_SIZE, MAP_SIZE);

// Helper to update blocked tiles in pathfinding grid
async function syncPathGrid() {
  const builtStructures = await Structure.find({ isUnderConstruction: false });
  builtStructures.forEach(s => {
    pathGrid.setWalkableAt(s.gridX, s.gridZ, false);
  });
}

// -------------------------------------------------------------
// 3. SOCKET.IO GAME LOGIC & EVENT HANDLERS
// -------------------------------------------------------------
io.on('connection', async (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Create or fetch a test user for this session
  let user = await User.findOne({ username: 'Player1' });
  if (!user) {
    user = await User.create({ username: 'Player1', wood: 500, gold: 200 });
  }

  // Send initial game state to connected client
  const structures = await Structure.find({});
  socket.emit('initGameState', {
    user: { id: user._id, wood: user.wood, gold: user.gold },
    structures
  });

  // Handle Construction Requests (Server-Authoritative Timer)
  socket.on('requestBuild', async (data) => {
    const { gridX, gridZ, type } = data;
    const BUILD_COST_WOOD = 100;
    const BUILD_TIME_SECONDS = 5;

    const currentUser = await User.findById(user._id);
    if (currentUser.wood < BUILD_COST_WOOD) {
      return socket.emit('errorMsg', 'Not enough wood to build!');
    }

    const occupied = await Structure.findOne({ gridX, gridZ });
    if (occupied) {
      return socket.emit('errorMsg', 'Tile is already occupied!');
    }

    // Deduct resources
    currentUser.wood -= BUILD_COST_WOOD;
    await currentUser.save();

    // Create under-construction structure record
    const completesAt = new Date(Date.now() + BUILD_TIME_SECONDS * 1000);
    const structure = new Structure({
      gridX,
      gridZ,
      type: type || 'hall',
      ownerId: socket.id,
      isUnderConstruction: true,
      completesAt
    });
    await structure.save();

    // Broadcast construction started (Renders temporary state)
    io.emit('buildingStarted', { structure, updatedWood: currentUser.wood });

    // Server-side construction timer
    setTimeout(async () => {
      structure.isUnderConstruction = false;
      await structure.save();

      // Block pathfinding tile once building completes
      pathGrid.setWalkableAt(gridX, gridZ, false);

      io.emit('buildingCompleted', structure);
    }, BUILD_TIME_SECONDS * 1000);
  });

  // Handle Troop March Requests (A* Pathfinding Execution)
  socket.on('marchTroops', (data) => {
    const { startX, startZ, endX, endZ } = data;

    const gridClone = pathGrid.clone();
    const finder = new PF.AStarFinder({ allowDiagonal: false });
    const path = finder.findPath(startX, startZ, endX, endZ, gridClone);

    if (path.length === 0) {
      return socket.emit('errorMsg', 'No valid path available to destination!');
    }

    // Generate unique march ID and broadcast route waypoints
    const marchId = `march_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    io.emit('troopMarching', { marchId, path });
  });

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
  });
});

// Initialize grid blocking state from database and start server
syncPathGrid().then(() => {
  server.listen(3000, () => {
    console.log('Viking Strategy Game Server active at http://localhost:3000');
  });
});
