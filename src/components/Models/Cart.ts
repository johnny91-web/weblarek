import { IProduct } from '../../types/index';

export class Cart {
  private cartItems: IProduct[] = [];

  getCartItems(): IProduct[] {
    return this.cartItems;
  }

  addItem(item: IProduct): void {
    if (!this.hasItem(item.id)) {
      this.cartItems.push(item);
    }
  }

  removeItem(id: string): void {
    this.cartItems = this.cartItems.filter(item => item.id !== id);
  }

  clearCart(): void {
    this.cartItems = [];
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
