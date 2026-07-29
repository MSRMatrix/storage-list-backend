import { dataFunction } from "../helpers/dataFunction";
import Part from "../models/Part";

export const createPart = async (req, res, next) => {
  try {
    const { partNumber, name, quantity, price, lowLimit, description } =
      req.body;

    const userData = await dataFunction(req, res, next);
    const newPart = new Part({
      partNumber,
      name,
      quantity,
      price,
      lowLimit,
      description,
      userId: userData.user._id,
    });

    await newPart.save();

    const parts = await Part.find({ userId: userData.user._id });

    res.status(200).json({ newPart: parts, message: "Part created" });
  } catch (error) {
    next(error);
  }
};

export const editPart = async (req, res, next) => {
  try {
    const { _id, partNumber, name, quantity, price, lowLimit, description } =
      req.body;

    const userData = await dataFunction(req, res, next);

    const existingPart = await Part.findOne({
      partNumber,
      userId: userData.user._id,
      _id: { $ne: _id },
    });

    if (existingPart) {
      return res.status(409).json({
        message: "Part number already exists.",
      });
    }

    const updatedPart = await Part.findOneAndUpdate(
      {
        _id,
        userId: userData.user._id,
      },
      {
        partNumber,
        name,
        quantity,
        price,
        lowLimit,
        description,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedPart) {
      return res.status(404).json({
        message: "Part not found.",
      });
    }

    const parts = await Part.find({
      userId: userData.user._id,
    });

    return res.status(200).json({
      parts,
      message: "Part updated.",
    });
  } catch (error) {
    next(error);
  }
};

export const getData = async (req, res, next) => {
  try {
    const parts = await Part.find({ userId: req.user.id, deleted: false });
    res.json({ data: parts, message: "Data found!" });
  } catch (error) {
    next(error);
  }
};

export const softDelete = async (req, res, next) => {
  try {
    const userData = await dataFunction(req, res, next);

    const deletePart = await Part.findByIdAndUpdate(req.body._id, {
      deleted: true,
    });

    if (!deletePart) {
      return res.status(404).json({
        message: "Part not found",
      });
    }

    await deletePart.save();

    const parts = await Part.find({ userId: userData.user._id });

    res.status(200).json({
      message: "Part deleted!",
      parts: parts,
    });
  } catch (error) {
    next(error);
  }
};

export const hardDelete = async (req, res, next) => {
  try {
    const userData = await dataFunction(req, res, next);

    await Part.deleteMany({
      userId: userData.user._id,
    });

    res.status(200).json({
      message: "All parts deleted!",
    });
  } catch (error) {
    next(error);
  }
};


export const transferData = async (req, res, next) => {
  try {
    const {
      sourceEmail,
      sourcePassword,
      targetEmail,
      targetPassword,
      deleteAfterTransfer,
    } = req.body;

    const sourceUser = await User.findOne({
      email: sourceEmail,
    });

    if (!sourceUser) {
      return res.status(404).json({
        message: "Quellbenutzer nicht gefunden",
      });
    }

    const sourcePasswordCorrect = await bcrypt.compare(
      sourcePassword,
      sourceUser.password,
    );

    if (!sourcePasswordCorrect) {
      return res.status(401).json({
        message: "Passwort des Quellbenutzers falsch",
      });
    }

    const targetUser = await User.findOne({
      email: targetEmail,
    });

    if (!targetUser) {
      return res.status(404).json({
        message: "Zielbenutzer nicht gefunden",
      });
    }

    const targetPasswordCorrect = await bcrypt.compare(
      targetPassword,
      targetUser.password,
    );

    if (!targetPasswordCorrect) {
      return res.status(401).json({
        message: "Passwort des Zielbenutzers falsch",
      });
    }

    if (deleteAfterTransfer) {
      await Part.deleteMany({
        userId: sourceUser._id,
      });
    } else {
      await Part.updateMany(
        {
          userId: sourceUser._id,
        },
        {
          userId: targetUser._id,
        },
      );
    }

    res.status(200).json({
      message: "Transfer erfolgreich",
    });
  } catch (error) {
    next(error);
  }
};
