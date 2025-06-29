const express = require('express');
const router = express.Router();
const File = require('../models/courses'); // تأكد من مسار الموديل
const Category = require('../models/Category'); // تأكد من مسار الكاتيجوري

// API للبحث
router.get("/api/search", async (req, res) => {
    const query = req.query.query || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
  
    try {
      const results = await File.aggregate([
        {
          $lookup: {
            from: "categories", // اسم مجموعة الكاتيجوري في قاعدة البيانات
            localField: "category",
            foreignField: "_id",
            as: "categoryDetails",
          },
        },
        {
          $match: {
            $or: [
              { filename: { $regex: query, $options: "i" } },
              { description: { $regex: query, $options: "i" } },
              { "categoryDetails.name": { $regex: query, $options: "i" } },
            ],
          },
        },
        {
          $project: {
            filename: 1,
            description: 1,
            mimeType: 1,
            filePath: 1,
            category: { $arrayElemAt: ["$categoryDetails.name", 0] },
            createdAt: 1,
            userId: 1
          },
        },
        { $skip: skip },
        { $limit: limit }
      ]);

      // حساب العدد الإجمالي للنتائج
      const totalResults = await File.aggregate([
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryDetails",
          },
        },
        {
          $match: {
            $or: [
              { filename: { $regex: query, $options: "i" } },
              { description: { $regex: query, $options: "i" } },
              { "categoryDetails.name": { $regex: query, $options: "i" } },
            ],
          },
        },
        { $count: "total" }
      ]);

      const total = totalResults.length > 0 ? totalResults[0].total : 0;
  
      res.json({
        results,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalResults: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      });
    } catch (error) {
      console.error("Error during search:", error);
      res.status(500).json({ message: "Error fetching search results", error: error.message });
    }
  });
  
module.exports = router;
