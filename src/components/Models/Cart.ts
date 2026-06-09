import { IProduct } from '../../types/index';
import { IEvents } from '../base/Events';

export class Cart {
  private cartItems: IProduct[] = [];
  protected events: IEvents;

  constructor(events: IEvents) {
    this.events = events;
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
    this.events.emit('shopping-cart:changed');
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
