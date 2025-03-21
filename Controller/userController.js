const User = require("../Model/userModel");
const AppError = require("../Utils/AppError");

exports.getAllUsers = async function (req, res, next) {
  try {
    const users = await User.find();
    res.status(201).json({
      status: "sucess",
      totalUsers: users.length,
      message: users,
    });
  } catch (err) {
    return next(new AppError(err, 403));
  }
};

exports.getUser = async function (req, res, next) {
  try {
    const user = await User.findOne({ _id: req.params.id }).populate("friends");
    if (user === null) {
      return next(new AppError("Invalid Id or User doesn't exist.", 404));
    }
    res.status(201).json({
      status: "sucesss",
      message: user,
    });
  } catch (err) {
    return next(new AppError(err, 403));
  }
};

exports.updateUser = async function (req, res, next) {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (user === null) {
      return next(new AppError("Invalid Id or User doesn't exist.", 404));
    }

    user.phone = req.body.phone || user.phone;
    user.name = req.body.name || user.name;

    await user.save({ validateBeforeSave: false });

    res.status(201).json({
      status: "sucesss",
      message: user,
    });
  } catch (err) {
    return next(new AppError(err, 403));
  }
};

exports.deleteUser = async function (req, res, next) {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (user === null) {
      return next(new AppError("Invalid Id or User doesn't exist.", 404));
    }

    const message = await User.findByIdAndDelete(req.params.id);

    res.status(201).json({
      status: "sucesss",
    });
  } catch (err) {
    return next(new AppError(err, 403));
  }
};

exports.addFriend = async function (req, res, next) {
  try {
    const { friend } = req.body;
    const user = await User.findOne({
      $or: [{ email: friend }, { phone: friend }],
    });
    if (!user) {
      return next(new AppError("User doesn't exist.", 404));
    }

    const data = {
      _id: user._id,
      name: user.name,
      msg_name: `${user._id + req.user._id}`,
    };
    user.connections = [
      ...user.connections,
      {
        _id: req.user._id,
        name: req.user.name,
        msg_name: `${user._id + req.user._id}`,
      },
    ];
    user.friends = [...user.friends, req.user._id];
    if (req.user.connections.includes(user._id)) {
      return next(new AppError("User is already your friend", 404));
    }
    req.user.connections = [...req.user.connections, data];
    req.user.friends = [...req.user.friends, user._id];

    await req.user.save({ validateBeforeSave: false });
    await user.save({ validateBeforeSave: false });
    res.status(200).json({
      message: "Friend added.",
    });
  } catch (err) {
    console.log(err);
    return next(new AppError(err, 403));
  }
};
