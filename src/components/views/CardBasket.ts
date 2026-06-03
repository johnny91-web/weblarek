import { ensureElement } from '../../utils/utils';
import { Card, TCard } from './Card';

export type TCardBasket = TCard & {
  index?: number;
  id?: string;
};

export class CardBasket extends Card<TCardBasket> {
  protected indexElement: HTMLElement;
  protected deleteButton: HTMLButtonElement;
  protected _id?: string;

  constructor(container: HTMLElement) {
    super(container);

    this.indexElement = ensureElement<HTMLElement>('.basket__item-index', this.container);
    this.deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', this.container);
  }
  
  getDeleteButton(): HTMLButtonElement {
    return this.deleteButton;
  }

  set index(value: number) {
    this.indexElement.textContent = String(value);
  }

  set id(value: string) {
    this._id = value;
  }

  render(data: TCardBasket): HTMLElement {
    if (data.index !== undefined) {
      this.index = data.index;
    }
    if (data.id) {
      this.id = data.id;
    }

    super.render(data);
    return this.container;
  }
  setDeleteHandler(onRemove: () => void): void {
    this.deleteButton.addEventListener('click', onRemove);
  }
}
