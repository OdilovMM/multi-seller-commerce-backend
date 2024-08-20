const Category = require('./../models/categoryModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const formidable = require('formidable');
const cloudinary = require('cloudinary').v2;

exports.addCategory = catchAsync(async (req, res, next) => {
  const form = formidable();

  form.parse(req, async (error, fields, files) => {
    if (error) {
      return next(new AppError(error.message, 404));
    } else {
      let { name } = fields;
      let { image } = files;

      name = name.trim();
      const slug = name.split(' ').join('-');

      cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUD_API_KEY,
        api_secret: process.env.CLOUD_API_SECRET,
        secure: true,
      });
      try {
        const result = await cloudinary.uploader.upload(image.filepath, {
          folder: 'categories',
        });
        if (result) {
          const category = await Category.create({
            name,
            slug,
            image: result.url,
          });

          res.status(201).json({
            status: 'Category Added',
            data: category,
          });
        } else {
          return next(new AppError(error.message, 404));
        }
      } catch (error) {
        return next(new AppError(error.message, 500));
      }
    }
  });
});

exports.getAllCategories = catchAsync(async (req, res, next) => {
  const { page, search, parPage } = req.query;
  try {
    let skipPage = '';
    if (parPage && page) {
      skipPage = parseInt(parPage) * (parseInt(page) - 1);
    }

    if (search && page && parPage) {
      const categories = await Category.find({
        $text: { $search: search },
      })
        .skip(skipPage)
        .limit(parPage)
        .sort({ createdAt: -1 });

      const totalCategories = await Category.find({
        $text: { $search: search },
      }).countDocuments();
      res.status(200).json({
        categories,
        totalCategories,
      });
    } else if (search === '' && page && parPage) {
      const categories = await Category.find({})
        .skip(skipPage)
        .limit(parPage)
        .sort({ createdAt: -1 });

      const totalCategories = await Category.find({}).countDocuments();

      res.status(200).json({
        categories,
        totalCategories,
      });
    } else {
      const categories = await Category.find({}).sort({ createdAt: -1 });
      const totalCategories = await Category.find({}).countDocuments();
      res.status(200).json({
        categories,
        totalCategories,
      });
    }
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});
exports.getCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError('There is no any category with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product: category,
    },
  });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.categoryId);
  if (!category) {
    return next(new AppError('There is no any category with that ID', 404));
  }
  res.status(200).json({
    status: 'Category Deleted',
    data: {
      categoryId: category._id,
    },
  });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(
    req.params.categoryId,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!category) {
    return next(new AppError('There is no any category with that ID', 404));
  }

  res.status(200).json({
    status: 'Category updated',
    data: {
      product: category,
    },
  });
});
