import { User } from "../models/user.model";
import { adminListToAdd } from "./adminUserList";

export const addAdminUser = async (): Promise<void> => {
  try {
    for (let user of adminListToAdd) {
      const userExist = await User.findOne({
        $or: [
          {
            email: user.email,
          },
          {
            userName: user.email,
          },
        ],
      });
      if (!userExist) {
        const userCreation = await User.create({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          contactNumber: user.contactNumber,
          password: user.password,
          userName: user.userName,
        });
        console.log(
          `The Admin user ${user.firstName} ${user.lastName} has been added successfully.`
        );
      }
    }
  } catch (err: any) {
    console.log(err);
  }
};
