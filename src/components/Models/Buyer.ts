import { IBuyer, TPayment, IBuyerValidationErrors } from '../../types/index';
import { EventEmitter } from '../base/Events';

export class Buyer {
  private payment: TPayment | null = null;
  private email: string = '';
  private phone: string = '';
  private address: string = '';

  constructor(private events: EventEmitter) {}

  updateData(data: Partial<IBuyer>): void {
    Object.assign(this, data);
    // Эмит события об изменении данных покупателя
    this.events.emit('buyer:data-updated', { field: Object.keys(data)});
  }

  getData(): IBuyer {
    return {
      payment: this.payment,
      email: this.email,
      phone: this.phone,
      address: this.address
    };
  }

  clearData(): void {
    this.payment = null;
    this.email = '';
    this.phone = '';
    this.address = '';
    // Эмит события после очистки данных
    this.events.emit('data-cleared', { field: 'all' });
  }

  validate(): IBuyerValidationErrors {
    const errors: IBuyerValidationErrors = {};

    if (!this.payment) errors.payment = 'Не выбран вид оплаты';
    if (!this.email.trim()) errors.email = 'Укажите email';
    if (!this.phone.trim()) errors.phone = 'Укажите телефон';
    if (!this.address.trim()) errors.address = 'Укажите адрес доставки';

    return errors;
  }
}
