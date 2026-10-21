import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV}.local`, quiet: true });

// Defaults let a fresh clone run without any .env file
export const{
    PORT = '8000',
    NODE_ENV = 'development',
    NAMECHEAP_URL = 'https://www.namecheap.com/domains/registration/results/',
    DYNADOT_URL = 'https://www.dynadot.com/domain/search',
    PORKBUN_URL = 'https://porkbun.com/products/domains',
    SPACESHIP_URL = 'https://www.spaceship.com/domain-search/'
} = process.env
