export type CustomerType = 'retail' | 'salon' | 'wholesale';

export interface Customer {
  fullName: string;
  email: string;
  phone: string;
  customerType: CustomerType;
  address: string;
  province: string;
  city: string;
  postalCode: string;
}
