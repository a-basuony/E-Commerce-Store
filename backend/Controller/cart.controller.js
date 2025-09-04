import Product from "../model/product.model.js";

export const getCartProducts = async (req, res) => {
  try {
    const products = await Product.find({ _id: { $in: req.user.cartItems } }); // find all products
    // add quantity to each product
    const cartItems = products.map((product) => {
      const item = req.user.cartItems.find(
        (cartItem) => cartItem.id.toString() === product._id.toString()
      ); // find the cart item with the same id as the product
      return {
        ...product.toJSON(),
        quantity: item.quantity,
      };
    });

    res.status(200).json(cartItems);
  } catch (error) {
    console.log("Error in getCartProducts", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;

    const user = req.user;

    const existingProduct = user.cartItems.find(
      (item) => item.id.toString() === productId
    );

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      req.user.cartItems.push(productId);
    }

    await user.save();

    res.status(200).json(user.cartItems);
  } catch (error) {
    console.log("Error in addToCart", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      req.user.cartItems = [];
    } else {
      req.user.cartItems = req.user.cartItems.filter(
        (item) => item.id.toString() !== productId
      );
    }

    await req.user.save();
    return res.status(200).json(req.user.cartItems);
  } catch (error) {
    console.log("Error in removeAllFromCart", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;

    const existingProduct = user.cartItems.find(
      (item) => item.id.toString() === productId
    );

    if (existingProduct) {
      if (quantity === 0) {
        user.cartItems = user.cartItems.filter(
          (item) => item.id.toString() !== productId
        );
        await user.save();
        return res.status(200).json(user.cartItems);
      } else {
        existingProduct.quantity = quantity;
        await user.save();
        return res.status(200).json(user.cartItems);
      }
    } else {
      return res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    console.log("Error in updateQuantity", error.message);
    res.status(500).json({ message: error.message });
  }
};
