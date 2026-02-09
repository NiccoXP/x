const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const login = async (req, res) => {
  const { email, password } = req.body;
  
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  try {
    const isEmailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!isEmailValid.test(email)) {
      return res.status(400).json({ message: 'Invalid email' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 character long '});
    }
    
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const isMatched = await user.isPasswordCorrect(password);
    if (!isMatched) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const token = await user.generateJWT();
    
    delete user._doc.password;
    
    req.user = user;
    
    return res.status(201).json({ status: true, token, user: user });
    
  } catch (e) {
    res.status(500).json({ message: 'Internal server error' });
    console.error(e.message);
  }
}

const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  try {
    
    const isEmailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!isEmailValid.test(email)) {
      return res.status(400).json({ message: 'Invalid email' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 character long '});
    }
    
    const isEmailAlreadyExists = await User.findOne({ email });
    
    if (isEmailAlreadyExists) {
      return res.status(400).json({ message: 'Email already exists. Please try using different email' });
    }
    
    const hashedPassword = await User.hashPassword(password);
    
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword
    });
    
    const token = await newUser.generateJWT();
    
    delete newUser._doc.password;
    
    req.user = newUser;
    return res.status(201).json({ status: true, token, user: newUser });
    
  } catch (e) {
    res.status(500).json({ message: 'Internal server error' });
    console.error(e.message);
  }
}

const logout = (req, res) => {
  // logout logic
}

const update = async (req, res) => {
  // update logic
}


module.exports = { login, signup, logout, update };