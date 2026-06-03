import { IProduct } from '../../types/index';
import { EventEmitter } from '../base/Events';

export class Cart {
  private cartItems: IProduct[] = [];

  constructor(private events: EventEmitter) {
    this.subscribeToEvents();
  }

  private subscribeToEvents(): void {
    // Обработчик удаления товара из корзины
    this.events.on('shopping-cart:remove', (data: { id: string }) => {
      this.removeItem(data.id);
      // Эмиттим событие об изменении корзины — это запустит обновление интерфейса
      this.events.emit('shopping-cart:changed');
    });

    // Обработчик открытия корзины
    this.events.on('shopping-cart:open', () => {
      const isEmpty = this.getItemCount() === 0;
      this.events.emit('shopping-cart:opened', { isEmpty });
    });
  }

  getCartItems(): IProduct[] {
    return this.cartItems;
  }

  addItem(item: IProduct): void {
    if (!this.hasItem(item.id)) {
      this.cartItems.push(item);
      this.events.emit('shopping-cart:changed');
    }
  }

  removeItem(id: string): void {
    this.cartItems = this.cartItems.filter(item => item.id !== id);
  }

  clearCart(): void {
    this.cartItems = [];
    this.events.emit('shopping-cart:changed');
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((total, item) => {
      return total + (item.price || 0);
    }, 0);
  }

  getItemCount(): number {
    return this.cartItems.length;
  }

  hasItem(id: string): boolean {
    return this.cartItems.some(item => item.id === id);
  }
}
