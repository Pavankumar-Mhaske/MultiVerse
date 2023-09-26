import { Address } from "../../../models/apps/ecommerce/address.models.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { getMongoosePaginationOptions } from "../../../utils/helpers.js";

const createAddress = asyncHandler(async (req, res) => {
  const { addressLine1, addressLine2, pincode, city, state, country } =
    req.body;
  const owner = req.user._id;

  const address = await Address.create({
    addressLine1,
    addressLine2,
    city,
    country,
    owner,
    pincode,
    state,
  });

  return res
    .status(201)
    .json(new ApiResponse(200, address, "Address created successfully"));
});

const getAllAddresses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  /**
   * Aggregate() - method is a feature of the MongoDB driver for Node.js that allows you to perform complex data processing operations on a collection.
   * - In this case, the aggregate() method is being called on the Address model to create an aggregation pipeline.
   *
   * The aggregation operation is defined as an array of stages, and in this case, there is only one stage, which is a $match stage.
   * - The pipeline consists of a single stage that uses the $match operator to filter the documents in the Address collection based on the owner field.
   */
  const addressAggregation = Address.aggregate([
    {
      // $match Stage:
      $match: {
        // filteration criteria:
        owner: req.user._id,
      },
    },
  ]);

  /**
   * Pagination: Pagination is a technique for dividing a large number of addresses into smaller chunks, or pages.
   * Pagination is important because if there are a large number of addresses in the database, returning all of them in a single response could cause performance issues and slow down the application.
   * By using pagination, the code is able to limit the number of addresses that are returned in each response, making it easier to display the addresses in a user-friendly way.
   */
  const addresses = await Address.aggregatePaginate(
    addressAggregation,
    getMongoosePaginationOptions({
      page,
      limit,
      customLabels: {
        totalDocs: "totalAddresses",
        docs: "addresses",
      },
    })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, addresses, "Addresses fetched successfully"));
});

const getAddressById = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const address = await Address.findOne({
    _id: addressId,
    owner: req.user._id,
  });

  if (!address) {
    throw new ApiError(404, "Address does not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, address, "Address fetched successfully"));
});

const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const { addressLine1, addressLine2, pincode, city, state, country } =
    req.body;
  const address = await Address.findOneAndUpdate(
    {
      _id: addressId,
      owner: req.user._id,
    },
    {
      $set: {
        addressLine1,
        addressLine2,
        city,
        country,
        pincode,
        state,
      },
    },
    { new: true }
  );

  if (!address) {
    throw new ApiError(404, "Address does not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, address, "Address updated successfully"));
});

const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const address = await Address.findOneAndDelete({
    _id: addressId,
    owner: req.user._id,
  });

  if (!address) {
    throw new ApiError(404, "Address does not exist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { deletedAddress: address },
        "Address deleted successfully"
      )
    );
});

export {
  createAddress,
  getAllAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
};
