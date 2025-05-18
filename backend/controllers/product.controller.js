import Product from "../models/product.model.js";
import cloudinary from "../config/cloudinary.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    console.error(`Error in getAllProducts controller: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const getFeaturedProducts = async (req, res) => {
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    if(!featuredProducts) {
      return res.status(404).json({ error: "No featured products found" });
    }

    res.json(featuredProducts);
  } catch (error) {
    console.error(`Error in getFeaturedProducts controller: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    let { image } = req.body;
    if(image) {
      const cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" });
      image = cloudinaryResponse?.secure_url;
    }

    const product = await Product.create({
      name,
      description,
      price,
      image,
      category,
    });

    res.status(200).json(product);
  } catch (error) {
    console.error(`Error in createProduct controller: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if(!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if(product.image) {
      await cloudinary.uploader.destroy(`product/${product.image.split("/").pop().split(".")[0]}`)
      .catch((error) => {
        console.error(`Error deleting product image: ${error}`);
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(`Error in deleteProduct controller: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([{
      $sample: { size: 3 }
    }, {
      $project: {
        _id: 1,
        name: 1, 
        description: 1,
        image: 1, 
        price: 1,
      }
    }]);

    res.json(products);
  } catch (error) {
    console.error(`Error in getRecommendedProducts controller: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category }).lean();
    res.status(200).json(products);
  } catch (error) {
    console.error(`Error in getProductsByCategory controller: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if(product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await Product.save();
      res.status(200).json(updatedProduct);
    } else {
      res.status(400).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(`Error in toggleFeaturedProduct controller: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
}