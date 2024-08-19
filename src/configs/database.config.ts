import { registerAs } from "@nestjs/config";
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({path: "./env"});

export default registerAs('database', () => {
  if(process.env.APP_ENV == 'DEV'){
    return {
      'host': process.env.DB_DEV_HOST,
      'port': process.env.DB_DEV_PORT,
      'username': process.env.DB_DEV_USERNAME,
      'password': process.env.DB_DEV_PASSWORD,
      'name': process.env.DB_DEV_NAME,
    }
  }
  
  if(process.env.APP_ENV == 'PROD'){
    return {
      'host': process.env.DB_PROD_HOST,
      'port': process.env.DB_PROD_PORT,
      'username': process.env.DB_PROD_USERNAME,
      'password': process.env.DB_PROD_PASSWORD,
      'name': process.env.DB_PROD_NAME,
    }
  }

  if(process.env.APP_ENV == 'TEST'){
    return {
      'host': process.env.DB_TEST_HOST,
      'port': process.env.DB_TEST_PORT,
      'username': process.env.DB_TEST_USERNAME,
      'password': process.env.DB_TEST_PASSWORD,
      'name': process.env.DB_TEST_NAME,
    }
  }
});