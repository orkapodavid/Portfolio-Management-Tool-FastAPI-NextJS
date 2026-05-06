export const PRICER_NOTES = [
  "Field 'Model Ticker' is compulsory when 'Use Historical Spot' is True. Field 'Spot Price' is compulsory when 'Use Historical Spot' is False.",
  "Field 'Reset on Day' is compulsory if 'Reset Frequency' is greater than 'biweekly', and is unnecessary if 'Reset Frequency' is 'weekly' or 'biweekly'.",
  "Field 'Market Price Formula' has a format func([period]). [period] has a format 'd/m/y', 'x d/m/y' for x day or 'x wk d/m/y' for x week.",
  "Field 'Reset Price Formula' has a format func([x]). [x] is a fixed value that represents the market price. If field is empty, then reset price will be the executable price.",
  "Field 'Lookback Days' and 'Reset Multiplier' is compulsory when field 'Market Price Formula' is empty. Field 'Lookback Days' will start with the immediately preceding day.",
  "Field 'Interest Rate Ticker' or 'Interest Rate' should be set.",
  "Field 'Reset Cap' or 'Reset Floor Price' is optional.",
  "For formula can use any standard functions in python, numpy or pandas library.",
] as const;
