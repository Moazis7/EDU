const mongoose = require('mongoose');
const Category = require('./models/Category');
require('dotenv').config({ path: './config.env' });

// Default subjects for each level
const defaultSubjects = {
  prep1: [
    'اللغة العربية',
    'اللغة الإنجليزية',
    'الرياضيات',
    'العلوم',
    'الدراسات الاجتماعية',
    'التربية الدينية',
    'التربية الفنية',
    'التربية الرياضية',
    'الحاسب الآلي'
  ],
  prep2: [
    'اللغة العربية',
    'اللغة الإنجليزية',
    'الرياضيات',
    'العلوم',
    'الدراسات الاجتماعية',
    'التربية الدينية',
    'التربية الفنية',
    'التربية الرياضية',
    'الحاسب الآلي'
  ],
  prep3: [
    'اللغة العربية',
    'اللغة الإنجليزية',
    'الرياضيات',
    'العلوم',
    'الدراسات الاجتماعية',
    'التربية الدينية',
    'التربية الفنية',
    'التربية الرياضية',
    'الحاسب الآلي'
  ],
  sec1: [
    'اللغة العربية',
    'اللغة الإنجليزية',
    'الرياضيات',
    'الفيزياء',
    'الكيمياء',
    'الأحياء',
    'التاريخ',
    'الجغرافيا',
    'التربية الدينية',
    'التربية الفنية',
    'التربية الرياضية',
    'الحاسب الآلي'
  ],
  sec2: [
    'اللغة العربية',
    'اللغة الإنجليزية',
    'الرياضيات',
    'الفيزياء',
    'الكيمياء',
    'الأحياء',
    'التاريخ',
    'الجغرافيا',
    'التربية الدينية',
    'التربية الفنية',
    'التربية الرياضية',
    'الحاسب الآلي'
  ],
  sec3: [
    'اللغة العربية',
    'اللغة الإنجليزية',
    'الرياضيات',
    'الفيزياء',
    'الكيمياء',
    'الأحياء',
    'التاريخ',
    'الجغرافيا',
    'التربية الدينية',
    'التربية الفنية',
    'التربية الرياضية',
    'الحاسب الآلي'
  ]
};

async function addDefaultCategories() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('🗑️ Cleared existing categories');

    const categoriesToAdd = [];

    // Add categories for each level
    for (const [level, subjects] of Object.entries(defaultSubjects)) {
      for (const subject of subjects) {
        categoriesToAdd.push({
          name: subject,
          description: `مادة ${subject} للمرحلة ${level}`,
          level: level
        });
      }
    }

    // Insert all categories
    const result = await Category.insertMany(categoriesToAdd);
    console.log(`✅ Added ${result.length} categories successfully`);

    // Display summary
    console.log('\n📊 Categories Summary:');
    for (const [level, subjects] of Object.entries(defaultSubjects)) {
      console.log(`${level}: ${subjects.length} subjects`);
    }

    console.log('\n🎉 Default categories added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding default categories:', error);
    process.exit(1);
  }
}

// Run the script
addDefaultCategories(); 