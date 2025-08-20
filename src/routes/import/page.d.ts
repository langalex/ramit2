export type RamitAccount = {
  id: string;
  name: string;
};

export type RamitTransaction = {
  id: string;
  account_id: string;
  description: string;
  amount: number;
  date: number;
};
