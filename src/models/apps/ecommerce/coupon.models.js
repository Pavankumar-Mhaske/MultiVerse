import mongoose, { Schema } from "mongoose";
import { User } from "../auth/user.models.js";
import { CouponTypeEnum } from "../../../constants.js";

const couponSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    couponCode: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: Object.values(CouponTypeEnum),
      default: CouponTypeEnum.FLAT,
    },
    discountValue: {
      type: Number,
      required: true,
    },
    minimumCartValue: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    owner: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Coupon = mongoose.model("Coupon", couponSchema);