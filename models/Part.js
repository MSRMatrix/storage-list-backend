import mongoose, { Schema, model } from "mongoose";

const Database = process.env.DATABASE;

const PartStorageDb = mongoose.connection.useDb(Database);

const PartSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    partNumber: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    lowLimit: { type: Number, required: true },
    description: { type: String, default: "No description" },
    deleted: { type: Boolean, default: false },
  },
  { versionKey: false, strictQuery: true },
);

PartSchema.methods.toJSON = function () {
  const part = this.toObject();
  delete part._id;
  delete part.deleted;
  return part;
};

const Part = PartStorageDb.model("Part", PartSchema);

export default Part;
