import { ensureElement } from '../../utils/utils';
import { Card, TCard } from './Card';

export type TCardBasket = TCard & {
  index?: number;
  id?: string;
};

export class CardBasket extends Card<TCardBasket> {
  protected indexElement: HTMLElement;
  protected deleteButton: HTMLButtonElement;

  constructor(container: HTMLElement, onRemove: () => void) {
    super(container);

    this.indexElement = ensureElement<HTMLElement>('.basket__item-index', this.container);
    this.deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', this.container);
    this.deleteButton.addEventListener('click', onRemove);
  }

  getDeleteButton(): HTMLButtonElement {
    return this.deleteButton;
  }

  set index(value: number) {
    this.indexElement.textContent = String(value);
  }
}
