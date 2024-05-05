import User from "../model/User.js";
import OverallStat from "../model/OverallStat.js";
import Transaction from "../model/Transaction.js";
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
export const getDashboardStats = async (req, res) => {
  try {
    //hardcoded values
    const currentMonth = "April";
    const currentYear = 2024;
    const currentDay = "2024-04-15";
    const transactions = await Transaction.find().limit(50).sort({
      createdOn: -1,
    });
    const overallStat = await OverallStat.find({ year: currentYear });
    const {
      totalCustomer,
      yearlyTotalSoldUnits,
      yearlySalesTotal,
      monthlyData,
      salesByCategory,
    } = overallStat[0];

    const thisMonthStats = overallStat[0].monthlyData.find(({ month }) => {
      return month === currentMonth;
    });
    const todayStats = overallStat[0].dailyData.find(({ date }) => {
      return date === currentDay;
    });
    res.status(200).json({
      totalCustomer,
      yearlyTotalSoldUnits,
      yearlySalesTotal,
      monthlyData,
      salesByCategory,
      thisMonthStats,
      todayStats,
      transactions,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
