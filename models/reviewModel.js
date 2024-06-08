const {Schema, model} = require("mongoose");

const reviewSchema = new Schema({
    productId: {
        type: Schema.ObjectId,
        required : true
    },
    firstName: {
        type: String,
        required : true
    },
    rating: {
        type: Number,
        default : 0 
    },
    review: {
        type: String,
        required : true
    },
    date: {
        type: String,
        required : true
    } 
},{ timestamps: true })

const Review = model('Review',reviewSchema)
module.exports = Review