import { Cart } from "../../../models/apps/ecommerce/cart.models.js";
import { Coupon } from "../../../models/apps/ecommerce/coupon.models.js";
import { Product } from "../../../models/apps/ecommerce/product.models.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";

/**
 *
 * @param {string} userId
 *  * * @description A utility function, which querys the {@link Cart} model and returns the cart in `Promise<{_id: string, items: {_id: string, product: Product, quantity: number}[], cartTotal: number}>` format
 *  @returns {Promise<{_id: string, items: {_id: string, product: Product, quantity: number}[], cartTotal: number, discountedTotal: number, coupon: Coupon}>}
 */
export const getCart = async (userId) => {
  const cartAggregation = await Cart.aggregate([
    {
      $match: {
        owner: userId,
      },
    },
    /**
     * $unwind is a MongoDB aggregation pipeline stage that is used to deconstruct an array field in a document into multiple documents, one for each element of the array.
     * 
     * example - 
     * Suppose you have a Cart document that looks like this:
      {
          _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a1"),
          owner: ObjectId("60f9c3d2d9c8f4a5c8c8f5a0"),
          items: [
            { productId: ObjectId("60f9c3d2d9c8f4a5c8c8f5a2"), quantity: 2 },
            { productId: ObjectId("60f9c3d2d9c8f4a5c8c8f5a3"), quantity: 1 }
            ]
      }

      If you apply the $unwind stage to the items field, the resulting documents would look like this:

      {
          _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a1"),
          owner: ObjectId("60f9c3d2d9c8f4a5c8c8f5a0"),
          items: { productId: ObjectId("60f9c3d2d9c8f4a5c8c8f5a2"), quantity: 2 }
      },
      {
          _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a1"),
          owner: ObjectId("60f9c3d2d9c8f4a5c8c8f5a0"),
          items: { productId: ObjectId("60f9c3d2d9c8f4a5c8c8f5a3"), quantity: 1 }
      }
     */
    {
      $unwind: "$items",
    },

    /**
     * The $lookup stage uses the localField and foreignField options to specify the fields that should be used to perform the join between the two collections.
     * example - 
     * Suppose you have a Cart document that looks like this:
        {
          _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a1"),
          owner: ObjectId("60f9c3d2d9c8f4a5c8c8f5a0"),
          items: { productId: ObjectId("60f9c3d2d9c8f4a5c8c8f5a2"), quantity: 2 }
        }

        If you apply the $lookup stage to the Cart collection, the resulting document would look like this:

        {
          _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a1"),
          owner: ObjectId("60f9c3d2d9c8f4a5c8c8f5a0"),
          items: { productId: ObjectId("60f9c3d2d9c8f4a5c8c8f5a2"), quantity: 2 },
          product: {
            _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a2"),
            name: "Product A",
            price: 10.99,
            description: "This is product A",
            category: "Category A"
          }
        }

        As you can see, the $lookup stage has joined the Cart collection with the products collection based on the items.productId field in the Cart collection and the _id field in the products collection.
         This has allowed the product details to be added to the Cart document, which can be used for further operations in the pipeline.
     */
    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "product",
      },
    },

    /**
     * In the code here, the $project stage is being used to reshape the documents in the pipeline to include only the fields that are needed for the subsequent stages.
     * example - 
        Suppose you have a Cart document that looks like this:
          {
            _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a1"),
            owner: ObjectId("60f9c3d2d9c8f4a5c8c8f5a0"),
            items: [
              { productId: ObjectId("60f9c3d2d9c8f4a5c8c8f5a2"), quantity: 2 },
              { productId: ObjectId("60f9c3d2d9c8f4a5c8c8f5a3"), quantity: 1 }
            ],
            coupon: "SUMMER2021"
          }

        If you apply the $project stage to the Cart collection, the resulting document would look like this:

          {
            _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a1"),
            product: {
              _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a2"),
              name: "Product A",
              price: 10.99,
              description: "This is product A",
              category: "Category A"
            },
            quantity: 2,
            coupon: "SUMMER2021"
          }
          {
            _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a1"),
            product: {
              _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a3"),
              name: "Product B",
              price: 5.99,
              description: "This is product B",
              category: "Category B"
            },
            quantity: 1,
            coupon: "SUMMER2021"
          }
     */
    {
      $project: {
        // _id: 0,
        product: { $first: "$product" },
        quantity: "$items.quantity",
        coupon: 1, // also project coupon field
      },
    },
    /**
     * Specifically, the $group stage is used to group the documents by the _id field and calculate the total price of the cart based on the product price and quantity for each product in the cart.
     * example - 
        suppose you have a Cart document that looks like this:
        {
          _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a1"),
          items: [
            {
              product: {
                _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a2"),
                name: "Product A",
                price: 10.99,
                description: "This is product A",
                category: "Category A"
              },
              quantity: 2,
              coupon: "SUMMER2021"
            },
            {
              product: {
                _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a3"),
                name: "Product B",
                price: 5.99,
                description: "This is product B",
                category: "Category B"
              },
              quantity: 1,
              coupon: "SUMMER2021"
            }
          ]
        }

        If you apply the $group stage to the Cart collection, the resulting document would look like this:

        {
          _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a1"),
          items: [
            {
              product: {
                _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a2"),
                name: "Product A",
                price: 10.99,
                description: "This is product A",
                category: "Category A"
              },
              quantity: 2,
              coupon: "SUMMER2021"
            },
            {
              product: {
                _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a3"),
                name: "Product B",
                price: 5.99,
                description: "This is product B",
                category: "Category B"
              },
              quantity: 1,
              coupon: "SUMMER2021"
            }
          ],
          coupon: "SUMMER2021",
          cartTotal: 28.97
        }

     */
    {
      $group: {
        _id: "$_id",
        items: {
          $push: "$$ROOT",
        },
        coupon: { $first: "$coupon" }, // get first value of coupon after grouping
        cartTotal: {
          $sum: {
            $multiply: ["$product.price", "$quantity"], // calculate the cart total based on product price * total quantity
          },
        },
      },
    },
    /**
        * Suppose you have a Cart collection that contains the following documents:
        example -
        [
          {
            _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a1"),
            product: {
              _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a2"),
              name: "Product A",
              price: 10.99,
              description: "This is product A",
              category: "Category A"
            },
            quantity: 2,
            coupon: ObjectId("60f9c3d2d9c8f4a5c8c8f5a5")
          },
          {
            _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a3"),
            product: {
              _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a4"),
              name: "Product B",
              price: 5.99,
              description: "This is product B",
              category: "Category B"
            },
            quantity: 1,
            coupon: ObjectId("60f9c3d2d9c8f4a5c8c8f5a6")
          }
        ]

        After you apply the $group stage to the Cart collection
        {
          _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a1"),
          items: [
            {
              _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a1"),
              product: {
                _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a2"),
                name: "Product A",
                price: 10.99,
                description: "This is product A",
                category: "Category A"
              },
              quantity: 2,
              coupon: ObjectId("60f9c3d2d9c8f4a5c8c8f5a5")
            }
          ],
          coupon: ObjectId("60f9c3d2d9c8f4a5c8c8f5a5"),
          cartTotal: 21.98
        },
        {
          _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a3"),
          items: [
            {
              _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a3"),
              product: {
                _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a4"),
                name: "Product B",
                price: 5.99,
                description: "This is product B",
                category: "Category B"
              },
              quantity: 1,
              coupon: ObjectId("60f9c3d2d9c8f4a5c8c8f5a6")
            }
          ],
          coupon: ObjectId("60f9c3d2d9c8f4a5c8c8f5a6"),
          cartTotal: 5.99
        }

        After the $group stage, the $lookup stage is used to perform a left outer join between the Cart collection and the Coupons collection.
        {
          _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a1"),
          items: [
            {
              _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a1"),
              product: {
                _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a2"),
                name: "Product A",
                price: 10.99,
                description: "This is product A",
                category: "Category A"
              },
              quantity: 2,
              coupon: ObjectId("60f9c3d2d9c8f4a5c8c8f5a5")
            }
          ],
          coupon: {
            _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a5"),
            code: "SUMMER2021",
            discountType: "percentage",
            discountValue: 10
          },
          cartTotal: 21.98
        },
        {
          _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a3"),
          items: [
            {
              _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a3"),
              product: {
                _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a4"),
                name: "Product B",
                price: 5.99,
                description: "This is product B",
                category: "Category B"
              },
              quantity: 1,
              coupon: ObjectId("60f9c3d2d9c8f4a5c8c8f5a6")
            }
          ],
          coupon: [
            {
            _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a6"),
            code: "FALL2021",
            discountType: "fixed",
            discountValue: 2.5
          }
        ],
          cartTotal: 5.99
        }
     */
    {
      $lookup: {
        // lookup for the coupon
        from: "coupons",
        localField: "coupon",
        foreignField: "_id",
        as: "coupon",
      },
    },

    /**
        After the lookup stage...
        {
          _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a1"),
          items: [
            {
              product: {
                _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a2"),
                name: "Product A",
                price: 10.99,
                description: "This is product A",
                category: "Category A"
              },
              quantity: 2,
              coupon: ObjectId("60f9c3d2d9c8f4a5c8c8f5a5")
            }
          ],
          coupon: [
            {
              _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a5"),
              code: "SUMMER2021",
              discountType: "percentage",
              discountValue: 10
            }
          ],
          cartTotal: 21.98
        }

        After the $lookup stage, the first $addFields stage is used to extract the coupon document from the items array and set it as the value of the coupon field in the output documents.

        {
          _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a1"),
          items: [
            {
              product: {
                _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a2"),
                name: "Product A",
                price: 10.99,
                description: "This is product A",
                category: "Category A"
              },
              quantity: 2,
              coupon: ObjectId("60f9c3d2d9c8f4a5c8c8f5a5")
            }
          ],
          coupon: {
            _id: ObjectId("60f9c3d2d9c8f4a5c8c8f5a5"),
            code: "SUMMER2021",
            discountType: "percentage",
            discountValue: 10
          },
          cartTotal: 21.98
     */
    {
      $addFields: {
        // As lookup returns an array we access the first item in the lookup array
        coupon: { $first: "$coupon" },
      },
    },
    {
      $addFields: {
        discountedTotal: {
          // Final total is the total we get once user applies any coupon
          // final total is total cart value - coupon's discount value
          $ifNull: [
            {
              $subtract: ["$cartTotal", "$coupon.discountValue"],
            },
            "$cartTotal", // if there is no coupon applied we will set cart total as out final total
            ,
          ],
        },
      },
    },
  ]);

  /**
   * This code returns the first document in an array of cart documents after applying an aggregation pipeline. 
      If the array is empty or the first document is null or undefined, it returns a default object with default values for _id, items, cartTotal, and discountedTotal.
   */
  return (
    cartAggregation[0] ?? {
      _id: null,
      items: [],
      cartTotal: 0,
      discountedTotal: 0,
    }
  );
};

const getUserCart = asyncHandler(async (req, res) => {
  let cart = await getCart(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart fetched successfully"));
});

const addItemOrUpdateItemQuantity = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  // default value to the quantity is 1
  const { quantity = 1 } = req.body;

  // fetch user cart
  const cart = await Cart.findOne({
    owner: req.user._id,
  });
  // See if product that user is adding exist in the db
  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product does not exist");
  }

  // If product is there check if the quantity that user is adding is less than or equal to the product's stock
  if (quantity > product.stock) {
    // if quantity is greater throw an error
    throw new ApiError(
      400,
      product.stock > 0
        ? "Only " +
          product.stock +
          " products are remaining. But you are adding " +
          quantity
        : "Product is out of stock"
    );
  }

  // See if the product that user is adding already exists in the cart

  const addedProduct = cart.items?.find(
    (item) => item.productId.toString() === productId
  );

  if (addedProduct) {
    // If product already exist assign a new quantity to it
    // ! We are not adding or subtracting quantity to keep it dynamic. Frontend will send us updated quantity here
    addedProduct.quantity = quantity;
    // if user updates the cart remove the coupon associated with the cart to avoid misuse
    // Do this only if quantity changes because if user adds a new project the cart total will increase anyways
    if (cart.coupon) {
      cart.coupon = null;
    }
  } else {
    // if its a new product being added in the cart push it to the cart items
    cart.items.push({
      productId,
      quantity,
    });
  }
  // Finally save the cart
  await cart.save({ validateBeforeSave: true });

  const newCart = await getCart(req.user._id); // structure the user cart

  return res
    .status(200)
    .json(new ApiResponse(200, newCart, "Item added successfully"));
});

const removeItemFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);

  // check for product existence
  if (!product) {
    throw new ApiError(404, "Product does not exist");
  }

  const updatedCart = await Cart.findOneAndUpdate(
    {
      owner: req.user._id,
    },
    {
      // Pull the product inside the cart items
      // ! We are not handling decrement logic here that's we are doing in addItemOrUpdateItemQuantity method
      // ! this controller is responsible to remove the cart item entirely
      $pull: {
        items: {
          productId: productId,
        },
      },
    },
    { new: true }
  );

  let cart = await getCart(req.user._id);

  // check if the cart's new total is greater than the minimum cart total requirement of the coupon
  if (cart.coupon && cart.cartTotal < cart.coupon.minimumCartValue) {
    // if it is less than minimum cart value remove the coupon code which is applied
    updatedCart.coupon = null;
    await updatedCart.save({ validateBeforeSave: false });
    // fetch the latest updated cart
    cart = await getCart(req.user._id);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart item removed successfully"));
});

const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate(
    {
      owner: req.user._id,
    },
    {
      $set: {
        items: [],
        coupon: null,
      },
    },
    { new: true }
  );
  const cart = await getCart(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart has been cleared"));
});

export {
  getUserCart,
  addItemOrUpdateItemQuantity,
  removeItemFromCart,
  clearCart,
};
