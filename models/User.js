import mongoose, { Schema, model } from "mongoose";

const Database = process.env.DATABASE;

const PartStorageDb = mongoose.connection.useDb(Database);

const UserSchema = new Schema(
  {
    username: { type: String, default: "Nicht verfügbar" },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    company: { type: Boolean, default: false },
    currency: { type: String, default: "Euro" },
    deleted: { type: Boolean, default: false },
  },
  { versionKey: false, strictQuery: true },
);

UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user._id;
  delete user.deleted;
  return user;
};

const User = PartStorageDb.model("User", UserSchema);

export default User;