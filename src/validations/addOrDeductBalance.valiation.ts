import { checkSchema } from "express-validator";
import { trimInput } from "../utils/function";

export const addOrDeductBalanceValidation = () => {
  return checkSchema({
    balance: {
      notEmpty: {
        errorMessage: "Please enter the amount to add or deduct.",
      },
      isFloat: {
        options: { gt: 0 }, // greater than 0
        errorMessage: "Balance must be greater than 0.",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
    option: {
      notEmpty: {
        errorMessage: "Please enter the option.",
      },
      isIn: {
        options: [["add", "deduct"]],
        errorMessage: "Option must be either 'add' or 'deduct'.",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
  });
};
