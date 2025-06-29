const express = require('express');
const mongoose = require('mongoose');
const Cart = require('../models/mycourses'); // موديل الكارت
const auth = require('../middleware/auth');

const router = express.Router();

// **POST**: إضافة منتج إلى الكارت
router.post('/cart', auth, async (req, res) => {
    const { fileId, quantity } = req.body;

    if (!fileId || !quantity) {
        return res.status(400).json({ message: 'Invalid file or quantity' });
    }

    try {
        const existingCartItem = await Cart.findOne({
            userId: req.user._id,
            productId: fileId,
        });

        if (existingCartItem) {
            // زيادة الكمية إذا كان المنتج موجودًا بالفعل
            existingCartItem.quantity += quantity;
            await existingCartItem.save();
        } else {
            const newCartItem = new Cart({
                userId: req.user._id,
                productId: fileId,
                quantity, // إضافة الكمية هنا
            });
            await newCartItem.save();
        }

        res.status(201).json({ message: 'Product added to cart' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding product to cart', error: err.message });
    }
});

// **GET**: جلب الكارت للمستخدم الحالي
router.get('/cart', auth, async (req, res) => {
    try {
        const cartItems = await Cart.find({ userId: req.user._id })
            .populate('productId'); // استخدام populate لاسترجاع تفاصيل المنتج من قاعدة البيانات
        res.status(200).json(cartItems);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching cart items', error: err.message });
    }
});

// **DELETE**: حذف منتج من الكارت
router.delete('/cart/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid cart item ID' });
        }

        const cartItem = await Cart.findOneAndDelete({
            _id: id,
            userId: req.user._id
        });

        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        res.status(200).json({ message: 'Item removed from cart successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error removing item from cart', error: err.message });
    }
});

// **PUT**: تحديث كمية منتج في الكارت
router.put('/cart/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid cart item ID' });
        }

        if (!quantity || quantity < 1) {
            return res.status(400).json({ message: 'Invalid quantity' });
        }

        const cartItem = await Cart.findOneAndUpdate(
            {
                _id: id,
                userId: req.user._id
            },
            { quantity },
            { new: true }
        ).populate('productId');

        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        res.status(200).json(cartItem);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating cart item', error: err.message });
    }
});

module.exports = router;
