import redis from "../lib/redis.js";
import Product from "../model/product.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}); // find all products
    res.status(200).json({ products });
  } catch (error) {
    console.log("Error in getAllProducts", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get("featured_products");
    if (featuredProducts) {
      res.status(200).json(JSON.parse(featuredProducts));
    }

    // if not in redis get it from mongo db
    // .lean() to convert featuredProducts from Mongo document to js object => which is good for performance
    featuredProducts = await Product.find({ isFeatured: true }).lean(); // find all products

    if (!featuredProducts) {
      return res.status(404).json({ message: "No featured products found" });
    }
    // set in redis
    await redis.set("featured_products", JSON.stringify(featuredProducts));

    res.status(200).json(featuredProducts);
  } catch (error) {
    console.log("Error in getFeaturedProducts", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;

    let cloudinaryResponse = null;
    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      }); // upload image to cloudinary and get the url
    }

    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse.url ? cloudinaryResponse.url : "",
      category,
    });

    res.status(201).json(product);
  } catch (error) {
    console.log("Error in createProduct", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    // 1- get the product id
    const product = Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({ message: "Product not found" });
    }

    // 2- delete the product image from cloudinary
    if (product.image) {
      // const productId = product._id.toString();
      const publicId = product.image.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(publicId);
        console.log("Image deleted from cloudinary");
      } catch (error) {
        console.log("Error in deleting image from cloudinary", error.message);
      }

      // 3- delete the product from mongo db
      await Product.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Product deleted successfully" });
    }
  } catch (error) {
    console.log("Error in deleteProduct", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const product = await Product.aggregate([
      {
        $sample: {
          size: 3,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          image: 1,
        },
      },
    ]);

    res.status(200).json(product);
  } catch (error) {
    console.log("Error in getRecommendedProducts", error.message);
    res.status(500).json({ message: error.message });
  }
};
