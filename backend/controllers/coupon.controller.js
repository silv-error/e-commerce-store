import Coupon from "../models/coupon.model.js";

export const getCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({
      userId: req.user.id,
      isActive: true,
    }).lean();
    res.status(200).json(coupon || null);
  } catch (error) {
    console.error(`Error in getCoupon controller: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({
      code,
      userId: req.user.id,
      isActive: true,
    });
    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    if (coupon.expirationDate < new Date()) {
      coupon.isActive = false;
      await coupon.save();
      return res.status(404).json({ error: "Coupon expired" });
    }

    res.json({
      message: "Coupon is valid",
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
    });
  } catch (error) {
    console.error(`Error in validateCoupon controller: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
};
