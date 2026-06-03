import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { IHeader } from "../../types";


export class Header extends Component<IHeader> {
  protected counterElement: HTMLElement;
  protected basketButton: HTMLButtonElement;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);

    // Исправляем селекторы — добавляем точки для классов
    this.counterElement = ensureElement<HTMLElement>('.header__basket-counter', this.container);
    this.basketButton = ensureElement<HTMLButtonElement>('.header__basket', this.container);

    // Меняем имя события на согласованное ('shopping-cart:open')
    this.basketButton.addEventListener('click', () => {
      this.events.emit('shopping-cart:open');
    });
  }

  set counter(value: number) {
    this.counterElement.textContent = String(value);
  }
}
