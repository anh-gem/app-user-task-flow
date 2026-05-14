import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateToken, setCookies } from "../utils/jwt.js";

// Register User
export const registerMember = async (req, res) => {
  try {
    const { name, city, qualification, email, password } = req.body;

    // Validate input
    if (!name || !city || !qualification || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      city,
      qualification,
      email,
      password: hashedPassword,
      tasks: [],
      notifications: [],
    });

    await newUser.save();
    const token = generateToken(newUser); // FIX: was 'user', should be 'newUser'

    setCookies(res, token);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

// Login User
export const loginMember = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = generateToken(user);

    setCookies(res, token);
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

export const logoutMember = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.clearCookie("loggedIn", {
      secure: false,
      sameSite: "lax",
    });

    res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get User by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user", error: error.message });
  }
};

// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

// Update User
export const updateUser = async (req, res) => {
  try {
    console.log("========== UPDATE USER ==========");
    console.log("REQ BODY:", JSON.stringify(req.body, null, 2));

    const { id } = req.params;
    console.log("USER ID:", id);

    console.log(req.body);
    const { name, city, qualification, tasks, notifications } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (city !== undefined) updateData.city = city;
    if (qualification !== undefined) updateData.qualification = qualification;

    // Handle tasks mapping
    if (tasks !== undefined && Array.isArray(tasks)) {
      console.log("Processing tasks, count:", tasks.length);
      updateData.tasks = tasks.map((task) => {
        console.log("Mapping task:", task);
        return {
          _id: task._id || new mongoose.Types.ObjectId(),
          title: task.title,
          status: task.status,
          subtasks: (task.subtasks || []).map((sub) => ({
            _id: sub._id || new mongoose.Types.ObjectId(),
            subtask: sub.subtask,
            status: sub.status,
          })),
          createdAt: task.createdAt || new Date(),
          updatedAt: task.updatedAt || new Date(),
        };
      });

      console.log("Processed tasks:", updateData.tasks);
    }

    if (notifications !== undefined && Array.isArray(notifications)) {
      console.log("Processing notifications, count:", notifications.length);
      updateData.notifications = notifications.map((notif) => {
        console.log("Mapping notification:", notif);
        return {
          _id: notif._id || new mongoose.Types.ObjectId(),
          message: notif.message,
          createdAt: notif.createdAt || new Date(),
        };
      });
      console.log("Processed notifications:", updateData.notifications);
    }

    console.log("UPDATE DATA:", JSON.stringify(updateData, null, 2));

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        runValidators: false,
      },
    );

    console.log("UPDATED USER:", user);

    if (!user) {
      console.log("User not found with ID:", id);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("RESPONSE - User tasks count:", user.tasks?.length);
    console.log("========== UPDATE SUCCESS ==========");

    res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Error updating user",
      error: error.message,
    });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting user", error: error.message });
  }
};
