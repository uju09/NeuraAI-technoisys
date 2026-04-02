#!/bin/bash

# Backend folder name (change as needed)
PROJECT_NAME="backend"
mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

# Create folder structure
mkdir -p src/{controllers,models,routes,services,utils,middleware,config,jobs,validators}
mkdir -p tests/{unit,integration}
mkdir -p logs

# Create basic files
cat >.env.example <<EOF
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/db
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your_key_here
EOF

cat >.gitignore <<EOF
node_modules/
.env
logs/
dist/
coverage/
.DS_Store
EOF

cat >src/server.js <<EOF
const express = require('express');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
EOF

cat >src/routes/index.js <<EOF
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'API is working' });
});

module.exports = router;
EOF

cat >package.json <<EOF
{
  "name": "${PROJECT_NAME}",
  "version": "1.0.0",
  "description": "Node.js backend with modular structure",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.0.3",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^2.0.22",
    "jest": "^29.5.0"
  }
}
EOF

echo "✅ Backend structure created at ./$PROJECT_NAME"
echo "📦 Next steps:"
echo "   cd $PROJECT_NAME"
echo "   npm install"
echo "   npm run dev"
