require('dotenv').config();
const mongoose = require('mongoose');
const { User, Conversation } = require('./models');
const bcrypt = require('bcryptjs');

const seed = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Clear existing data
    await User.deleteMany({});
    await Conversation.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const user1 = await User.create({ username: 'Alice', email: 'alice@test.com', password: hashedPassword });
    const user2 = await User.create({ username: 'Bob', email: 'bob@test.com', password: hashedPassword });

    // Create a "Message Request" (isAccepted: false)
    await Conversation.create({
        participants: [user1._id, user2._id],
        isAccepted: false,
        vanishMode: false
    });

    console.log("✅ Seed complete: Alice has a message request from Bob!");
    process.exit();
};

seed();
