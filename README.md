# Transaction System

- A simple Node.js project demonstrating how to perform atomic transactions using MongoDB and Mongoose. It includes User and Order models, API endpoints with Express, and transaction handling with commit/rollback to ensure data consistency (all-or-nothing).

---

## Deployment

- To clone this project

```bash
  git clone https://github.com/ShreyashSalian/transaction.git
```

- Go to the folder user-authenication

```bash
  cd login-system
```

- Initialize Git (If Required)

```bash
  git init
```

- Install NPM Packages

```bash
  npm install
```

- Setup Environment Variables,
  PORT=5000,
  MONGODB_URI=your_mongodb_connection_string,
  ACCESS_TOKEN=your_jwt_access_secret,
  REFRESH_TOKEN=your_jwt_refresh_secret,

- Build the Project (Compile TypeScript). Compiles .ts files to .js inside the dist/ directory.

```bash
  npm run build
```

- Run the compiled version:

```bash
  npm run start
```
