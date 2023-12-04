/*
|--------------------------------------------------------------------------
| Validating Environment Variables
|--------------------------------------------------------------------------
|
| In this file we define the rules for validating environment variables.
| By performing validation we ensure that your application is running in
| a stable environment with correct configuration values.
|
| This file is read automatically by the framework during the boot lifecycle
| and hence do not rename or move this file to a different location.
|
*/

const host = process.env.HOST as string;
const port = parseInt(process.env.PORT as string, 10);
const appKey = process.env.APP_KEY as string;
const appName = process.env.APP_NAME as string;
const driveDisk = process.env.DRIVE_DISK as 'local';
const nodeEnv = process.env.NODE_ENV as 'development' | 'production' | 'test';


const MYSQL_HOST = process.env.MYSQL_HOST;
const MYSQL_PORT = parseInt(process.env.MYSQL_PORT as string, 10);
const MYSQL_USER = process.env.MYSQL_USER;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD as string; // Make it optional, providing a default value if not set
const MYSQL_DB_NAME = process.env.MYSQL_DB_NAME;


export default {
	HOST: host,
	PORT: port,
	APP_KEY: appKey,
	APP_NAME: appName,
	DRIVE_DISK: driveDisk,
	NODE_ENV: nodeEnv,
	MYSQL_HOST,
	MYSQL_PORT,
	MYSQL_USER,
	MYSQL_PASSWORD,
	MYSQL_DB_NAME,
};