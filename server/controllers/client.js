import Product from "../model/Product.js";
import ProductStat from "../model/ProductStat.js";
import Transaction from "../model/Transaction.js";
import getCountryISO3 from "country-iso-2-to-3";
import User from "../model/User.js";
import countryIso2To3 from "country-iso-2-to-3";
export const getProducts = async (req, res) => {
  try {
    const product = await Product.find();
    const productWithStat = await Promise.all(
      product.map(async (product) => {
        const stat = await ProductStat.find({
          productId: product._id,
        });
        return {
          ...product._doc,
          stat,
        };
      })
    );
    res.status(200).json(productWithStat);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
export const getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: "user" }).select("-password");
    res.status(200).json(customers);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
export const getTransaction = async (req, res) => {
  try {
    // sort should look like this:{"field":"userId","sort":"desc"}
    const { page = 1, pageSize = 20, sort = null, search = "" } = req.body;
    // formatted sort should look like this:{userId:-1}
    const generateSort = () => {
      const sortParsed = JSON.parse(sort);
      const sortFormatted = {
        [sortParsed.field]: (sortParsed.sort = "asc" ? 1 : -1),
      };
      return sortFormatted;
    };
    const sortFormatted = Boolean(sort) ? generateSort() : {};
    const transactions = await Transaction.find({
      $or: [
        { cost: { $regex: new RegExp(search, "i") } },
        { userId: { $regex: new RegExp(search, "i") } },
      ],
    })
      .sort(sortFormatted)
      .skip(page * pageSize)
      .limit(pageSize);
    const total = await Transaction.countDocuments({
      name: { $regex: search, $options: "i" },
    });
    res.status(200).json({ transactions, total });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
export const getGeography = async (req, res) => {
  try {
    const users = await User.find();
    const mappedLocations = users.reduce((acc, { country }) => {
      const coutryISO3 = getCountryISO3(country);
      if (!acc[coutryISO3]) {
        acc[coutryISO3] = 0;
      }
      acc[coutryISO3]++;
      return acc;
    }, {});
    const formattedLocation = Object.entries(mappedLocations).map(
      ([country, count]) => {
        return { id: country, value: count };
      }
    );
    res.status(200).json(formattedLocation);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
