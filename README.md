# Login System

- A Node.js + TypeScript authentication system using MongoDB and Redis. Supports secure login/signup with JWT, bcrypt password hashing, account lockout with exponential backoff, and IP/username-based rate limiting to safely handle ~1000 requests per minute.

---

## Deployment

- To clone this project

```bash
  git clone https://github.com/ShreyashSalian/login-system.git
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
