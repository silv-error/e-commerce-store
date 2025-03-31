import Product from "../models/product.model.js";

import cloudinary from "../config/cloudinary.js";

export async function getProducts(req, res) {
  try {
    const products = await Product.find({});
    res.status(200).json({success: true, products});
  } catch (error) {
    console.error(`Error getting products: ${error.message}`);
    res.status(500).json({success: false, error: "Internal server error"});
  }
}

export async function featuredProducts(req, res) {
  try {
    // .lean() returns a plain JavaScript object instead of a Mongoose document
    featuredProducts = await Product.find({isFeatured: true}).lean();
    if(!featuredProducts) {
      return res.status(404).json({success: false, error: "No featured products found"});
    }

    res.status(200).json({success: true, products: featuredProducts});
  } catch (error) {
    console.error(`Error getting featured products: ${error.message}`);
    res.status(500).json({success: false, error: "Internal server error"});
  }
}

export async function createProduct(req, res) {
  try {
    const { name, description, price, image, category } = req.body;

    let cloudinaryResponse = null

    if(image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {folder: "products"});
    }

    const products = await Product.create({
      name, 
      description,
      price,
      image: cloudinaryResponse?.secure_url || "",
      category
    });

    res.status(201).json({products, success: true});
  } catch (error) {
    console.error(`Error creating products: ${error.message}`);
    res.status(500).json({success: false, error: "Internal server error"});
  }
}

export async function deleteProduct(req, res) {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    if(!product) {
      return res.status(404).json({success: false, error: "Product not found"});
    }

    await Product.findByIdAndDelete(productId);

    if(!product.image) return res.status(200).json({success: true, message: "Product deleted successfully"});

    const publicId = product.image.split("/").pop().split(".")[0];

    try {
      await cloudinary.uploader.destroy(`products/${publicId}`);
    } catch (error) {
      console.error(`Error in deleting image from cloudinary: ${error.message}`);
    }

    return res.status(200).json({success: true, message: "Product deleted successfully"});
  } catch (error) {
    console.error(`Error deleting products: ${error.message}`);
    res.status(500).json({success: false, error: "Internal server error"});
  }
}

export async function getRecommendedProducts(req, res) {
  try {
    const products = await Product.aggregate([
      {
        $sample: { size: 3 }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
        }
      }
    ]);

    res.status(200).json({success: true, products});
  } catch (error) {
    console.error(`Error getting recommended products: ${error.message}`);
    res.status(500).json({success: false, error: "Internal server error"});
  }
}

export async function getProductsByCategory(req, res) {
  try {
    const category = req.params.category;
    const products = await Product.find({category});
    res.json(200).json({success: true, products});
  } catch (error) {
    console.error(`Error getting products by category: ${error.message}`);
    res.status(500).json({success: false, error: "Internal server error"});
  }
}

export async function toggleFeaturedProduct(req, res) {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);

    if(product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      res.status(200).json({success: true, updatedProduct});
    } else {
      res.status(404).json({success: false, error: "Product not found"});
    }
  } catch (error) {
    console.error(`Error toggling featured product: ${error.message}`);
    res.status(500).json({success: false, error: "Internal server error"});
  }
}