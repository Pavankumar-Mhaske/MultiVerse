import { CouponTypeEnum } from "../../../constants.js";
import { Coupon } from "../../../models/apps/ecommerce/coupon.models.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

const createCoupon = asyncHandler(async (req, res) => {
  const {
    name,
    couponCode,
    type = CouponTypeEnum.FLAT,
    discountValue,
    minimumCartValue,
    startDate,
    expiryDate,
  } = req.body;

  const duplicateCoupon = await Coupon.findOne({
    couponCode: couponCode.trim().toUpperCase(),
  });

  if (duplicateCoupon) {
    throw new ApiError(
      409,
      "Coupon with code " + duplicateCoupon.couponCode + " already exists"
    );
  }

  const coupon = await Coupon.create({
    name,
    couponCode,
    type,
    discountValue,
    minimumCartValue,
    startDate,
    expiryDate,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, coupon, "Coupon created successfully"));
});

const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({});
  return res
    .status(200)
    .json(new ApiResponse(200, coupons, "Coupons fetched successfully"));
});

const getCouponById = asyncHandler(async (req, res) => {
  const { couponId } = req.params;

  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    throw new ApiError(404, "Coupon does not exists");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, coupon, "Coupon deleted successfully"));
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const { couponId } = req.params;

  const deletedCoupon = await Coupon.findByIdAndDelete(couponId);
  if (!deletedCoupon) {
    throw new ApiError(404, "Coupon does not exists");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, { deletedCoupon }, "Coupon deleted successfully")
    );
});

export { createCoupon, getAllCoupons, deleteCoupon, getCouponById };