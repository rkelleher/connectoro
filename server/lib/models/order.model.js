import mongoose from "mongoose";

const PaymentMethodSchema = new mongoose.Schema({
  nameOnCard: String,
  number: String,
  securityCode: String,
  expirationMonth: Number,
  expirationYear: Number,
  useGift: Boolean
});

const ProductSchema = new mongoose.Schema({
  productId: String, // retailer's id
  quantity: Number,

  sellerSelectionCriteria: {
    addon: Boolean,
    conditionIn: [String],
    handlingDaysMax: Number,
    maxItemPrice: Number,
    minSellerNumRatings: Number,
    prime: Boolean,
  }
});

const AddressSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  addressLine1: String,
  addressLine2: String,
  zipCode: String,
  city: String,
  state: String,
  // http://www.theodora.com/country_digraphs.html
  countryCode: String,
  phoneNumber: String,
});

const RetailerCredentialSchema = new mongoose.Schema({
  email: String,
  password: String
});


const OrderSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },

  inputId: {
    type: String,
    index: true
  },
  inputOrder: Object,
  inputIntegrationType: String,

  retailer: String,
  products: [ProductSchema],
  shippingAddress: AddressSchema,
  shippingMethod: String,
  billingAddress: AddressSchema,
  paymentMethod: PaymentMethodSchema,
  retailerCredentials: RetailerCredentialSchema,

  giftMessage: String,
  isGift: Boolean,
  maxPrice: Number,
  clientPrice: Object,
  fbe: Boolean
});

export const Order = mongoose.model("Order", OrderSchema);
