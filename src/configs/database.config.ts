import { registerAs } from "@nestjs/config";
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({path: "./env"});

export default registerAs('database', () => {
  if(process.env.APP_ENV == 'DEV'){
    return {
      'url': process.env.MONGODB_URL_DEV,
      'username': process.env.MONGODB_USERNAME_DEV,
      'password': process.env.MONGODB_PASSWORD_DEV,
      'name': process.env.MONGODB_NAME_DEV,
    }
  }else if(process.env.APP_ENV == 'TEST'){
    return {
      'url': process.env.MONGODB_URL_TEST,
      'username': process.env.MONGODB_USERNAME_TEST,
      'password': process.env.MONGODB_PASSWORD_TEST,
      'name': process.env.MONGODB_NAME_TEST,
    }
  }else if(process.env.APP_ENV == 'PROD'){
    return {
      'url': process.env.MONGODB_URL_PROD,
      'username': process.env.MONGODB_USERNAME_PROD,
      'password': process.env.MONGODB_PASSWORD_PROD,
      'name': process.env.MONGODB_NAME_PROD,
    }
  }
});