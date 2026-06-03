import { IBuyer, TPayment, IBuyerValidationErrors } from '../../types/index';
import { EventEmitter } from '../base/Events';

export class Buyer {
  private payment: TPayment | null = null;
  private email: string = '';
  private phone: string = '';
  private address: string = '';

  constructor(private events: EventEmitter) {
    this.subscribeToEvents();
  }

  private subscribeToEvents(): void {
    // Обработчик изменений в форме заказа (оплата и адрес)
    this.events.on('order:changed', (data: { field: string; value: string }) => {
      if (data.field === 'payment') {
        this.updateData({ payment: data.value as TPayment });
      } else if (data.field === 'address') {
        this.updateData({ address: data.value });
      }
      this.events.emit('buyer-data:changed', { field: data.field });
    });

    // Обработчик изменений в форме контактов (email и телефон)
    this.events.on('contacts:changed', (data: { field: string; value: string }) => {
      if (data.field === 'email') {
        this.updateData({ email: data.value });
      } else if (data.field === 'phone') {
        this.updateData({ phone: data.value });
      }
      this.events.emit('buyer-data:changed', { field: data.field });
    });

    // Обновление форм при изменении данных покупателя
    this.events.on('buyer-data:changed', (data: { field: string }) => {
      const validation = this.validate();
      const buyerData = this.getData();

      // Эмиттим событие с полной информацией для обновления UI
      this.events.emit('buyer-data:updated', {
        data: buyerData,
        validation: validation,
        field: data.field
      });
    });
  }

  updateData(data: Partial<IBuyer>): void {
    Object.assign(this, data);
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
