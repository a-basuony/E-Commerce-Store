import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "code is required"],
      unique: true,
    },
    discountPercentage: {
      type: Number,
      required: [true, "discountPercentage is required"],
      min: 0,
      max: 100,
    },
    expirationDate: {
      type: Date,
      required: [true, "expirationDate is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required"],
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
