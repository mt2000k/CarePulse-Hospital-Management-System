const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { connectDB } = require('./config/db');
const User = require('./models/User');
const { runSeed } = require('./seed/seed');

let PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is empty (e.g. running in-memory or fresh DB)
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Server] Database is empty. Running automatic seed initialization...');
      await runSeed({ exit: false });
    }

    const server = app.listen(PORT, () => {
      console.log(`\n=======================================================`);
      console.log(`🏥 HMS Backend Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`🌐 Server Listening on: http://localhost:${PORT}`);
      console.log(`=======================================================\n`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Error: Port ${PORT} is already in use by another process.`);
        console.error(`💡 Solution: Close the existing Node process occupying port ${PORT} or update PORT in backend/.env.\n`);
        process.exit(1);
      } else {
        console.error('Server error:', err);
      }
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
