import { IApi, IProductsResponse, IOrder, IOrderConfirmation, IProduct } from '../../types/index';

export class ApiService {
  private api: IApi;

  constructor(api: IApi) {
    this.api = api;
  }

  async getProducts(): Promise<IProductsResponse> {
  return this.api.get<IProductsResponse>('/product/');
}



  async orderProducts(order: IOrder): Promise<IOrderConfirmation> {
    return this.api.post<IOrderConfirmation>('/order/', order);
  }
}


export default ApiService;
