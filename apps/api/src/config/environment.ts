import dotenv from 'dotenv';
import path from 'path';

// Load root or local .env
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'powerguard_super_secure_jwt_secret_key_2026_industrial_ai_final_year',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  energyTariff: parseFloat(process.env.ENERGY_TARIFF || '0.15'),
  peakTariff: parseFloat(process.env.PEAK_TARIFF || '0.28'),
  emissionFactor: parseFloat(process.env.EMISSION_FACTOR || '0.42'),
  peakDemandThresholdKw: parseFloat(process.env.PEAK_DEMAND_THRESHOLD_KW || '160.0'),
  aiSystemMode: (process.env.AI_SYSTEM_MODE || 'ASSISTED') as 'AUTO' | 'ASSISTED' | 'MANUAL',
  simulationTickMs: parseInt(process.env.SIMULATION_TICK_MS || '2000', 10),
  simulationSpeed: parseInt(process.env.SIMULATION_SPEED || '1', 10),
};
