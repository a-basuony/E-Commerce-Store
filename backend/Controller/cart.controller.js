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
