import mongoose from "mongoose";

const country = {
  official_name_en: {
    type: String,
    default: ""
  },
  'ISO3166-1-numeric': {
    type: Number
  },
  alpha_2: {
    type: String,
    default: ""
  },
  default_easync_retailer: {
    type: String,
    default: ""
  },
  default_easync_shipping: {
    type: String,
    default: ""
  }
};

const DefaultCountryCodeSchema= new mongoose.Schema({
  accountId: mongoose.Schema.Types.ObjectId,
  countries: [country]
});

const CountryCodeSchema= new mongoose.Schema(country);

export const DefaultCountry = mongoose.model("default_country", CountryCodeSchema);
export const Country = mongoose.model("country", DefaultCountryCodeSchema);
