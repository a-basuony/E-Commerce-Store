import redis from "../lib/redis.js";
import Product from "../model/product.model.js";

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
