export type Province = {
  id: number;
  name: string;
};

export type City = {
  id: number;
  province_id: number;
  name: string;
};

export type Courier =
  | "jne"
  | "tiki"
  | "pos";

export type CourierResult = {
  name: string;
  code: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
};

export type CostRequest = {
  origin: string;
  destination: string;
  weight: number;
  courier: Courier;
};

export type SelectedShipping = {
  courier: string;
  courierName: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
};