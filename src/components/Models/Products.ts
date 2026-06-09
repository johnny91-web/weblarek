import { IProduct } from '../../types/index';
import { EventEmitter } from '../base/Events';

export class Products {
  private items: IProduct[] = [];
  private selectedProduct: IProduct | null = null;

  constructor(private events: EventEmitter) {}

  setItems(items: IProduct[]): void {
    this.items = items;
    // Эмиттим событие об обновлении каталога товаров
    this.events.emit('products:updated');
  }

  getItems(): IProduct[] {
    return this.items;
  }

  getProductById(id: string): IProduct | undefined {
    return this.items.find(item => item.id === id);
  }

  setSelectedProduct(product: IProduct): void {
    this.selectedProduct = product;
    // Эмиттим событие о выборе товара
    this.events.emit('product:selected', product);
  }

  getSelectedProduct(): IProduct | null {
    return this.selectedProduct;
  }
}