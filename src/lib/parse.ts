import Parse from 'parse/dist/parse.min.js';
import { User } from '../models/user';
import { Clinical } from '../models/clinical';
import { ParseConfigParams } from './config/parse-config-params';
import { ParseCloudCode } from './helpers/parse-cloud-code';

if (!import.meta.env.VITE_PARSE_APP_ID || !import.meta.env.VITE_PARSE_SERVER_URL) {
  throw new Error('Missing Parse Server environment variables');
}

// Initialize Parse
Parse.initialize(import.meta.env.VITE_PARSE_APP_ID,import.meta.env.VITE_PARSE_JAVASCRIPT_KEY);
Parse.serverURL = import.meta.env.VITE_PARSE_SERVER_URL;

Parse.enableEncryptedUser();
Parse.secret = import.meta.env.VITE_PARSE_JAVASCRIPT_KEY;

Parse.User.registerSubclass(User.className, User);
Parse.Object.registerSubclass(Clinical.className, Clinical);

// Connection state management
let isConnected = false;
let connectionAttempts = 0;
const MAX_RETRIES = 5;
const RETRY_DELAY = 2000;

// Test connection
async function testConnection(): Promise<boolean> {
  try {
    // await Parse.Cloud.run('ping');
    await Parse.Config.get()
    isConnected = true;
    return true;
  } catch (error) {
    console.warn('Connection test failed:', error);
    return false;
  }
}

// Initialize connection with exponential backoff
export async function initializeConnection(): Promise<boolean> {
  while (connectionAttempts < MAX_RETRIES) {
    try {
      const connected = await testConnection();
      if (connected) {
        console.info('Successfully connected');
        return true;
      }

      connectionAttempts++;
      if (connectionAttempts < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(2, connectionAttempts - 1);
        console.info(`Retrying connection in ${delay}ms (attempt ${connectionAttempts}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.warn('Connection attempt failed:', error);
      connectionAttempts++;
    }
  }

  console.error('Failed to establish connection after maximum retries');
  return false;
}

// Reset connection state
export function resetConnection(): void {
  isConnected = false;
  connectionAttempts = 0;
}

// Event listeners for online/offline status
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    console.info('Network connection restored, attempting to reconnect...');
    resetConnection();
    await initializeConnection();
  });

  window.addEventListener('offline', () => {
    console.warn('Network connection lost');
    isConnected = false;
  });
}

// Utility to check connection status
export function isParseConnected(): boolean {
  return isConnected;
}

// Utility to get current connection attempt
export function getConnectionAttempts(): number {
  return connectionAttempts;
}

export { Parse };


export async function checkParseConnection() {
  const isConnected = await testConnection();
  if (isConnected) {
    console.log('Parse Server connection successful.');
  } else {
    console.log('Failed to connect to Parse Server.');
  }
}

export async function checkAppInstallation(): Promise<boolean> {
  return Parse.Config.get().then(function (config: any) {
    // Get the installation status from parse config
    return config.get(ParseConfigParams.installed);
  }, function () {
    // Something went wrong checking the app installation status from parse config
    return false;
  });
}

export async function getParseConfig(){
  const config = await Parse.Config.get();
  return config;
}

export async function createNewInstallation(){

  try {
    const installationId = await Parse._getInstallationId();

    const result = await ParseCloudCode.createNewInstallation(installationId);

    // console.log("Result: " + result.message);

  } catch (error){
    // console.log("Cloud function return error: " + error);
  }
}