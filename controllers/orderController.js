const CustomerOrder = require('../models/customerOrderModel');
const AuthOrder = require('../models/authOrderModel');
const Cart = require('../models/cartModel');
const MyWallet = require('../models/myWalletModel');
const SellerWallet = require('../models/sellerWalletModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { ObjectId } = require('mongoose').Types;
const stripe = require('stripe')(process.env.SECRET_KEY_STRIPE);
const moment = require('moment');

const paymentCheck = async (id) => {
  try {
    const order = await CustomerOrder.findById(id);
    if (order.paymentStatus === 'unpaid') {
      //
      await CustomerOrder.findByIdAndUpdate(id, {
        deliveryStatus: 'canceled',
      });
      await AuthOrder.updateMany(
        {
          orderId: id,
        },
        {
          deliveryStatus: 'canceled',
        },
      );
    }
    return true;
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

exports.placeNewOrder = catchAsync(async (req, res, next) => {
  const {
    products,
    items,
    shippingFee,
    price,
    shippingToAddress,
    userId,
    navigate,
  } = req.body;

  let authorOrderData = [];
  let cartId = [];
  const formatData = moment(Date.now()).format('LLL');
  let customerOrderProduct = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i].products;
    for (let j = 0; j < product.length; j++) {
      const tempCustomerProduct = product[j].productInfo;
      tempCustomerProduct.quantity = product[j].quantity;
      customerOrderProduct.push(tempCustomerProduct);
      if (product[j]._id) {
        cartId.push(product[j]._id);
      }
    }
  }

  try {
    const order = await CustomerOrder.create({
      customerId: userId,
      shippingInfo: shippingToAddress,
      products: customerOrderProduct,
      price: price + shippingFee,
      paymentStatus: 'unpaid',
      deliveryStatus: 'pending',
      date: formatData,
    });

    for (let i = 0; i < products.length; i++) {
      const sellerProduct = products[i].products;
      const totalPrice = products[i].price;
      const sellerId = products[i].sellerId;
      let storeProducts = [];
      for (let j = 0; j < sellerProduct.length; j++) {
        const tempSellerProduct = sellerProduct[j].productInfo;
        tempSellerProduct.quantity = sellerProduct[j].quantity;
        storeProducts.push(tempSellerProduct);
      }
      authorOrderData.push({
        orderId: order.id,
        sellerId,
        products: storeProducts,
        price: totalPrice,
        paymentStatus: 'unpaid',
        shippingInfo: 'Market Warehouse',
        deliveryStatus: 'pending',
        date: formatData,
      });
    }

    await AuthOrder.insertMany(authorOrderData);
    for (let k = 0; k < cartId.length; k++) {
      await Cart.findByIdAndDelete(cartId[k]);
    }
    setTimeout(
      () => {
        paymentCheck(order.id);
      },
      10 * 60 * 1000,
    ); // cancel in  10 minutes later if not payment done

    res.status(201).json({
      status: 'Order placed',
      data: {
        orderId: order.id,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

exports.getAllOrdersByStatus = catchAsync(async (req, res, next) => {
  const { status, userId } = req.params;

  let orders = [];

  try {
    if (status !== 'all') {
      orders = await CustomerOrder.find({
        customerId: new ObjectId(userId),
        deliveryStatus: status,
      });
    } else {
      orders = await CustomerOrder.find({
        customerId: new ObjectId(userId),
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        orders,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

exports.getOrderDetail = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const myOrder = await CustomerOrder.findById(orderId);

  res.status(200).json({
    status: 'success',
    data: {
      myOrder,
    },
  });
});

exports.customerOrderMake = catchAsync(async (req, res, next) => {
  const { price } = req.body;

  try {
    const payment = await stripe.paymentIntents.create({
      amount: price * 100,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(201).json({
      status: 'success',
      clientSecret: payment.client_secret,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

exports.orderConfirm = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  try {
    await CustomerOrder.findByIdAndUpdate(orderId, {
      paymentStatus: 'paid',
    });
    await AuthOrder.updateMany(
      {
        orderId: new ObjectId(orderId),
      },
      {
        paymentStatus: 'paid',
        deliveryStatus: 'pending',
      },
    );
    const cuOrder = await CustomerOrder.findById(orderId);

    const auOrder = await AuthOrder.find({
      orderId: new ObjectId(orderId),
    });

    const time = moment(Date.now()).format('l');
    const splitTime = time.split('/');

    await MyWallet.create({
      amount: cuOrder.price,
      month: splitTime[0],
      year: splitTime[2],
    });

    for (let i = 0; i < auOrder.length; i++) {
      await SellerWallet.create({
        sellerId: auOrder[i].sellerId.toString(),
        amount: auOrder[i].price,
        month: splitTime[0],
        year: splitTime[2],
      });
    }
    res.status(201).json({
      status: 'success',
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

exports.getCustomerDashboardData = catchAsync(async (req, res) => {
  try {
    const { userId } = req.params;

    const recentOrders = await CustomerOrder.find({
      customerId: new ObjectId(userId),
    }).limit(5);
    const pendingOrder = await CustomerOrder.find({
      customerId: new ObjectId(userId),
      deliveryStatus: 'pending',
    }).countDocuments(5);
    const totalOrder = await CustomerOrder.find({
      customerId: new ObjectId(userId),
    }).countDocuments();
    const cancelledOrder = await CustomerOrder.find({
      customerId: new ObjectId(userId),
      deliveryStatus: 'canceled',
    }).countDocuments();

    res.status(200).json({
      status: 'success',
      data: {
        recentOrders,
        pendingOrder,
        totalOrder,
        cancelledOrder,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
});

// seller related orders below

exports.getSellerOrders = catchAsync(async (req, res, next) => {
  const { sellerId } = req.params;
  let { page, search, parPage } = req.query;

  page = parseInt(page);
  parPage = parseInt(parPage);

  const skipPage = parPage * (page - 1);

  if (search) {
  } else {
    const orders = await AuthOrder.find({
      sellerId,
    })
      .skip(skipPage)
      .limit(parPage)
      .sort({
        createdAt: -1,
      });

    const totalOrders = await AuthOrder.find({
      sellerId,
    }).countDocuments();

    res.status(200).json({
      status: 'success',
      data: {
        orders,
        totalOrder: totalOrders.length,
      },
    });
  }
});

exports.getSellerSingleOrderDetail = catchAsync(async (req, res) => {
  const { orderId } = req.params;

  const order = await AuthOrder.findById(orderId);
  res.status(200).json({
    status: 'success',
    data: {
      order,
    },
  });
});

exports.sellerOrderUpdateStatus = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const product = await AuthOrder.findById(orderId);
  const updated = await AuthOrder.findByIdAndUpdate(orderId, {
    deliveryStatus: status,
  });
  res.status(200).json({
    status: 'Order Updated',
  });
});

// Get Admin Orders

exports.getAdminOrders = catchAsync(async (req, res, next) => {
  let { page, search, parPage } = req.query;
  page = parseInt(page);
  parPage = parseInt(parPage);
  const skipPage = parPage * (page - 1);

  if (search) {
  } else {
    const orders = await CustomerOrder.aggregate([
      {
        $lookup: {
          from: 'authorders',
          localField: '_id',
          foreignField: 'orderId',
          as: 'suborder',
        },
      },
    ])
      .skip(skipPage)
      .limit(parPage)
      .sort({
        createdAt: -1,
      });

    const totalOrders = await CustomerOrder.aggregate([
      {
        $lookup: {
          from: 'authorders',
          localField: '_id',
          foreignField: 'orderId',
          as: 'suborder',
        },
      },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        orders,
        totalOrder: totalOrders.length,
      },
    });
  }
});

exports.getSingleOrderDetail = catchAsync(async (req, res) => {
  const { orderId } = req.params;

  const order = await CustomerOrder.aggregate([
    {
      $match: {
        _id: new ObjectId(orderId),
      },
    },
    {
      $lookup: {
        from: 'authorders',
        localField: '_id',
        foreignField: 'orderId',
        as: 'suborder',
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      order: order[0],
    },
  });
});

exports.adminOrderUpdateStatus = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const updated = await CustomerOrder.findByIdAndUpdate(orderId, {
    deliveryStatus: status,
  });

  res.status(200).json({
    status: 'Order Updated',
  });
});
