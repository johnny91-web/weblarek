import { categoryMap, CDN_URL } from "../../utils/constants";
import { IProduct, ICardActions } from "../../types";
import { Card } from "./Card";
import { ensureElement } from "../../utils/utils";

type CategoryKey = keyof typeof categoryMap;
export type TCardPreview = Pick<IProduct, 'image' | 'category' | 'description'>;

export class CardPreview extends Card<TCardPreview> {
  protected categoryElement: HTMLElement;
  protected imageElement: HTMLImageElement;
  protected descriptionElement: HTMLElement;
  protected cardButton: HTMLButtonElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container);

    this.categoryElement = ensureElement<HTMLElement>('.card__category', this.container);
    this.imageElement = ensureElement<HTMLImageElement>('.card__image', this.container);
    this.descriptionElement = ensureElement<HTMLElement>('.card__text', this.container);
    this.cardButton = ensureElement<HTMLButtonElement>('.card__button', this.container);

    if (actions?.onButtonClick) {
      this.cardButton.addEventListener('click', actions.onButtonClick);
    }
  }

  set category(value: string) {
    Object.values(categoryMap).forEach(className => {
      this.categoryElement.classList.remove(className);
    });

    this.categoryElement.textContent = value;

    if (categoryMap[value as CategoryKey]) {
      this.categoryElement.classList.add(categoryMap[value as CategoryKey]);
    }
  }

  set image(value: string) {
    const imageUrl = CDN_URL + value.slice(0, -3) + 'png';
    this.setImage(this.imageElement, imageUrl, this.titleElement?.textContent || '');
  }

  set description(value: string) {
    this.descriptionElement.textContent = value;
  }

  set disabled(value: boolean) {
    this.cardButton.disabled = value;
  }

  set cardButtonText(value: string) {
    this.cardButton.textContent = value;
  }

}
