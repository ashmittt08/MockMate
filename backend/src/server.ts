import app from './app';
import { config } from './config/env';

const startServer = () => {
  try {
    app.listen(config.port, () => {
      console.log(`=============================================`);
      console.log(`🚀 MockMate Server is running on port ${config.port}`);
      console.log(`🌐 API Base URL: http://localhost:${config.port}`);
      console.log(`🔧 Environment: ${config.nodeEnv}`);
      console.log(`=============================================`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
