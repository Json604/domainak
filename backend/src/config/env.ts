import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV}.local` });

export const{
    PORT,
    NODE_ENV,
    GODADDY_URL,
    HOSTINGER_URL,
    NAMECHEAP_URL,
    DYNADOT_URL,
    PORKBUN_URL,
    SPACESHIP_URL
} = process.env