import User from "../model/user.model.js";
import redis from "../lib/redis.js";
import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(
    `refresh_token: ${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60
  ); // 7days
};

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, // prevent xss attack, cross site scripting attack
    secure: process.env.NODE_ENV === "production", // in production it will be only https
    sameSite: "strict", // prevents CSRF attack , cross-site request forgery attack
    maxAge: 15 * 60 * 1000, // 15 min
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // prevent xss attack, cross site scripting attack
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // prevents CSRF attack , cross-site request forgery attack
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    // if user exist
    const userExist = await User.findOne({ email });
    if (userExist) {
      res.status(400).json({ message: "User already exists" });
      throw new Error("User already exist");
    }
    const user = await User.create({ name, email, password });

    // authenticate
    const { accessToken, refreshToken } = generateToken(user._id); // it saved _id in mongo by default
    await storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    // we shouldn't pass the hole user because it contain the hashed password
    // so we will return the user without the password
    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: "User created successfully",
    });
  } catch (error) {
    console.log("Error in signup", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      const { accessToken, refreshToken } = generateToken(user._id);

      await storeRefreshToken(user._id, refreshToken);
      setCookies(res, accessToken, refreshToken);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res
        .status(401)
        .json({ message: "Invalid credentials email or password" });
    }
  } catch (error) {
    console.log("Error in login", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    // in server.js app.use(cookieParser()); // allows you to parse the cookies

    const refreshToken = req.cookies.refreshToken; // get the refresh token from the cookies
    if (refreshToken) {
      const decode = jwt.decode(refreshToken, process.env.REFRESH_TOKEN_SECRET); // decode the refresh token
      await redis.del(`refresh_token: ${decode.userId}`); // delete the refresh token from the redis
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.log("Error in logout", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// this will refresh the access token / recreate an access token
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ message: "No refresh token provided" });
    }

    const decode = jwt.decode(refreshToken, process.env.REFRESH_TOKEN_SECRET); // decode the refresh token
    const userId = decode.userId;

    const storedToken = await redis.get(`refresh_token: ${userId}`); // get the refresh token from the redis

    if (refreshToken !== storedToken) {
      res.status(401).json({ message: "Invalid refresh token" });
    }

    const accessToken = jwt.sign(
      { userId: decode.userId },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true, // prevent xss attack, cross site scripting attack
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", // prevents CSRF attack , cross-site request forgery attack
      maxAge: 15 * 60 * 1000, // 50min
    });

    res.json({ message: "Token refreshed successfully" });
  } catch (error) {
    console.log("Error in refreshToken controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
