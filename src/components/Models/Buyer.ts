import { IBuyer, TPayment, IBuyerValidationErrors } from '../../types/index';

export class Buyer {
  private payment: TPayment | null = null;
  private email: string = '';
  private phone: string = '';
  private address: string = '';

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
