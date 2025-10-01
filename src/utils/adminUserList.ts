interface AdminUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  contactNumber: string;
  userName: string;
}

export const adminListToAdd: AdminUser[] = [
  {
    firstName: "Shreyash",
    lastName: "Salian",
    password: "Admin@123",
    userName: "ShreyashSalian",
    role: "admin",
    contactNumber: "1234567890",
    email: "shreyashsalian15@gmail.com",
  },
  {
    firstName: "Admin",
    lastName: "Admin",
    email: "admin123@gmail.com",
    userName: "AdminAdmin",
    password: "Admin@123",
    role: "admin",
    contactNumber: "987654321",
  },
  {
    firstName: "Rohit",
    lastName: "sharma",
    email: "rohit@gmail.com",
    password: "Rohit@123",
    userName: "RohitSharma",
    role: "user",
    contactNumber: "1231231231",
  },
  {
    firstName: "Virat",
    lastName: "Kohli",
    email: "virat23@gmail.com",
    userName: "ViratKholi",
    password: "Virat@123",
    role: "user",
    contactNumber: "987654311",
  },
];
