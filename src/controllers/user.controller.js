import User from "../models/User.js";

export const findUser = async (req, res) => {
  const { phone, autoNumber } = req.query;

  const user = await User.findOne({
    $or: [{ phone }, { autoNumber }],
  });

  if (!user) return res.status(404).json({ message: "Topilmadi" });

  res.json(user);
};
