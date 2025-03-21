const User = require("../Model/userModel");
const AppError = require("../Utils/AppError");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const jwtToken = function (id) {
  const token = jwt.sign({ id }, process.env.JWT_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
  return token;
};

exports.signup = async function (req, res, next) {
  try {
    const data = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
    };

    const user = await User.create(data);
    if (!user) {
      return next(new AppError("signup failed...", 404));
    }
    const token = jwtToken(user._id);
    res.cookie("auth", token, {
      httpOnly: false,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      status: "sucess",
      token: token,
      message: user,
    });
  } catch (err) {
    console.log(err);
    return next(new AppError(err, 403));
  }
};

exports.login = async function (req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError("User doesn't exists.", 404));
    }

    if (!(await user.checkPassword(user.password, password))) {
      return next(new AppError("Password is inccorect.", 404));
    }

    const token = jwtToken(user._id);
    res.cookie("auth", token, {
      httpOnly: false,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      status: "sucess",
      token: token,
      message: user,
    });
  } catch (err) {
    return next(new AppError(err, 403));
  }
};

exports.authGuard = async function (req, res, next) {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.auth) {
      token = req.cookies.auth;
    }
    console.log(req.cookies);

    if (!token) {
      return next(
        new AppError("You are not logged in! Please log in to get access.", 401)
      );
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_KEY);
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(
        new AppError("User change their password or doesn't exist.", 401)
      );
    }
    req.user = user;
    next();
  } catch (err) {
    return next(new AppError(err, 403));
  }
};

exports.isUserLogedIn = async function (req, res, next) {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.auth) {
      token = req.cookies.auth;
    }
    if (!token) {
      return next(
        new AppError("You are not logged in! Please log in to get access.", 401)
      );
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_KEY);
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(
        new AppError("User change their password or doesn't exist.", 401)
      );
    }
    res.status(202).json({
      status: "success",
      message: user,
    });
  } catch (err) {
    return next(new AppError(err, 403));
  }
};

exports.logout = async function (req, res, next) {
  try {
    if (!req.cookies.auth) {
      return next(
        new AppError("You are not logged in! Please log in to get access.", 401)
      );
    }

    res.clearCookie("auth");
    res.status(201).json({
      status: "sucesss",
    });
  } catch (err) {
    return next(new AppError(err, 403));
  }
};
