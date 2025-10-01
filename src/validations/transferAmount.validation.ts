import { checkSchema } from "express-validator";
import { trimInput } from "../utils/function";

export const transferAmountValidation = () => {
  return checkSchema({
    amount: {
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
    receiverId: {
      notEmpty: {
        errorMessage: "Please select the receiver.",
      },

      customSanitizer: {
        options: trimInput,
      },
    },
  });
};
