import { pgEnum } from 'drizzle-orm/pg-core';

export const brokerEnum = pgEnum('broker', ['dhan', 'mstock']);
export const roleEnum = pgEnum('role', ['user', 'admin']);
export const strategyEnum = pgEnum('strategy', ['MOMETF0812FR', 'MOMETF0508FR', 'MOMETF0508WE']);

export type Strategy = (typeof strategyEnum.enumValues)[number];

export type Broker = (typeof brokerEnum.enumValues)[number];
