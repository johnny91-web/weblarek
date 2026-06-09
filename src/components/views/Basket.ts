import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { IEvents } from "../base/Events";
import { IBasket } from '../../types/index';

export class Basket extends Component<IBasket> {
  protected basketListElement: HTMLElement;
  protected placeButton: HTMLButtonElement;
  protected priceElement: HTMLElement;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);

    this.basketListElement = ensureElement<HTMLElement>('.basket__list', this.container);
    this.placeButton = ensureElement<HTMLButtonElement>('.basket__button', this.container);
    this.priceElement = ensureElement<HTMLElement>('.basket__price', this.container);

    this.placeButton.addEventListener('click', () => {
      this.events.emit('order:open');
    });
  }

  set items(value: HTMLElement[]) {
    this.basketListElement.replaceChildren(...value);
  }

  set price(value: number) {
    this.priceElement.textContent = `${value} синапсов`;
  }

  setPurchaseOpportunity(isEmpty: boolean) {
    this.placeButton.disabled = isEmpty;
  }
}
