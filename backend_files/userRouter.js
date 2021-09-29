import express from "express";
import User from "./userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import authentication from "./authentication.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    let { email, password, passwordCheck, username } = req.body;
    if (!email || !password || !passwordCheck) {
      return res.status(400).json({ msg: "Please fill all the fields." });
    }

    if (password.length < 5) {
      return res
        .status(400)
        .json({ msg: "The password must have 5 characters long." });
    }
    if (password !== passwordCheck) {
      return res.status(400).json({
        msg: "The password is not the same, please enter the same password as above",
      });
    }

    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      return res.status(400).json({
        msg: "The email is already registered in our database, please use another email",
      });
    }

    if (!username) username = email;

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: passwordHash,
      username,
    });
    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Please fill all the fields" });
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        msg: "There is no any account registered on the system with this email.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: "Wrong account or password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/tokenIsValid", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.json(false);

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) return res.json(false);

    const user = await User.findById(verified.id);
    if (!user) return res.json(false);

    return res.json(true);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", authentication, async (req, res) => {
  const user = await User.findById(req.user);
  res.json({
    username: user.username,
    id: user._id,
  });
});

export default router;
