export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
    get<T extends object>(uri: string): Promise<T>;
    post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
}

export interface IBuyer {
  payment: TPayment | null;
  email: string;
  phone: string;
  address: string;
}

export type TPayment = 'card' | 'cash';

export interface IOrder extends IBuyer{
    total: number;
    items: string[];

}
// Типы для ответов сервера
export interface IProductsResponse {
  total: number;      
  items: IProduct[]; 
}


export interface IOrderConfirmation {
  orderId: string;
  total: number;
  status: 'confirmed' | 'pending' | 'failed';
}

 export interface IBuyerValidationErrors {
  payment?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface IBasket {
  items: HTMLElement[];
  price: number;
}

export interface ICardActions {
  onClick?: (event: MouseEvent) => void;
  onButtonClick?: (event: MouseEvent) => void;
}

export interface IForm {
  valid: boolean;
  errors: string[];
}

export interface IGallery {
  catalog: HTMLElement[];
}

export interface IHeader {
  counter: number;
}

export interface IModal {
  content: HTMLElement;
}

export interface ISuccess {
  total: number;
}

export interface ISuccessActions {
  onClick: () => void;
}
