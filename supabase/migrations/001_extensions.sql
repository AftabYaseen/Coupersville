-- Enable pgcrypto for gen_random_uuid() and security code encryption
create extension if not exists pgcrypto;
