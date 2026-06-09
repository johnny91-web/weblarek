import './scss/styles.scss';
import { IProduct, IProductsResponse, IBuyerValidationErrors, IBuyer, TPayment} from './types/index';
import { EventEmitter } from './components/base/Events';
import { Products } from './components/Models/Products';
import { Gallery } from './components/views/Gallery';
import { cloneTemplate, ensureElement } from './utils/utils';
import { CardCatalog } from './components/views/CardCatalog';
import { Modal } from './components/views/Modal';
import { Success } from './components/views/Success';
import { CardBasket } from './components/views/CardBasket';
import { Header } from "./components/views/Header";
import { Basket } from "./components/views/Basket";
import { OrderForm } from "./components/views/OrderForm";
import { ContactsForm } from "./components/views/ContactsForm";
import { Cart } from './components/Models/Cart';
import { CardPreview } from './components/views/CardPreview';
import { Buyer } from './components/Models/Buyer';
import { ApiService } from './components/Services/ApiService';
import { API_URL } from './utils/constants';
import { Api } from './components/base/Api';

// Создание экземпляров классов (в правильном порядке — сначала все экземпляры, потом подписки)
const events = new EventEmitter();
const productsModel = new Products(events);
const apiModel = new Api(API_URL);
const apiService = new ApiService(apiModel);
const modal = new Modal(ensureElement('#modal-container'), events);
const gallery = new Gallery(ensureElement('.gallery'));
const cart = new Cart(events);
const header = new Header(ensureElement('.header'), events);
const basket = new Basket(cloneTemplate('#basket'), events);
const buyerModel = new Buyer(events);
const currentOrderForm = new OrderForm(cloneTemplate("#order"), events);
const currentContactsForm = new ContactsForm(cloneTemplate("#contacts"), events);
const success = new Success(cloneTemplate("#success"), {
  onClick: () => {
    modal.close();
  }
});
const cardPreview = new CardPreview(
  cloneTemplate('#card-preview'),
  {
    onButtonClick: () => {
      events.emit('card-button:clicked');
    }
  }
);

// Загрузка товаров с сервера
apiService
  .getProducts()
  .then((result: IProductsResponse) => {
    console.log('Товары получены с сервера');
    productsModel.setItems(result.items);
  })
  .catch((error) => {
    console.error('Ошибка при загрузке товаров:', error);
  });

// Обновление галереи при получении товаров
events.on('products:updated', () => {
  const items = productsModel.getItems().map((item: IProduct) => {
    const cardCatalog = new CardCatalog(
      cloneTemplate('#card-catalog'),
      {
        onClick: () => events.emit('card:selected', item)
      }
    );
    return cardCatalog.render(item);
  });
  gallery.render({ catalog: items });
  //проверяем состояние корзины для деактивации кнопки "оформить"
  const isEmpty = cart.getItemCount() === 0;
  basket.setPurchaseOpportunity(isEmpty);
  basket.price = cart.getTotalPrice() || 0;
});

// Выбор товара — устанавливаем выбранный товар
events.on('card:selected', (item: IProduct) => {
  productsModel.setSelectedProduct(item);
});

// Открытие карточки товара с возможностью добавления/удаления из корзины
events.on('product:selected', (item: IProduct) => {
  modal.content = cardPreview.render({
    title: item.title,
    price: item.price,
    image: item.image,
    category: item.category,
    description: item.description,
  });
  modal.open();
  updateCardButtonState(item);
});


// Обработка нажатия кнопки в карточке товара
events.on('card-button:clicked', () => {
  const selectedProduct = productsModel.getSelectedProduct();
  if (!selectedProduct) return;

  if (cart.hasItem(selectedProduct.id)) {
    events.emit('shopping-cart:remove', { id: selectedProduct.id });
  } else if (selectedProduct.price !== null && selectedProduct.price !== undefined) {
    events.emit('shopping-cart:add', { item: selectedProduct });
  }
  modal.close();
});

// Добавление товара в корзину
events.on('shopping-cart:add', (data: { item: IProduct }) => {
  cart.addItem(data.item);
});

// Удаление товара из корзины
events.on('shopping-cart:remove', (data: { id: string }) => {
  cart.removeItem(data.id);
});

// Корзина
events.on('shopping-cart:changed', () => {
  header.counter = cart.getItemCount();

  const cartItems = cart.getCartItems()
    .map((item, index) => {
      const cardBasket = new CardBasket(cloneTemplate('#card-basket'), () => {
        events.emit('shopping-cart:remove', { id: item.id });
      });

      const renderedElement = cardBasket.render({
        id: item.id,
        title: item.title,
        price: item.price,
        index: index + 1,
      });

      return renderedElement;
    });

  basket.items = cartItems;
  basket.price = cart.getTotalPrice() || 0;
  const isEmpty = cart.getItemCount() === 0;
  basket.setPurchaseOpportunity(isEmpty);

  const selectedProduct = productsModel.getSelectedProduct();
  if (selectedProduct) {
    updateCardButtonState(selectedProduct);
  }
});

function updateCardButtonState(product: IProduct): void {
  let buttonText: string;
  let isDisabled: boolean;

  if (product.price === null || product.price === undefined) {
    buttonText = 'Недоступно';
    isDisabled = true;
  } else if (cart.hasItem(product.id)) {
    buttonText = 'Удалить из корзины';
    isDisabled = false;
  } else {
    buttonText = 'В корзину';
    isDisabled = false;
  }

  cardPreview.cardButtonText = buttonText;
  cardPreview.disabled = isDisabled;
}

// Обработчик открытия корзины
events.on('shopping-cart:open', () => {
  modal.content = basket.render();
  modal.open();
});

      // Формы
      
      
events.on('buyer-data:updated', (data: { field: string; value: string }) => {
  console.log('Получены данные покупателя:', data);

  // Обновляем модель Buyer
  if (data.field === 'payment') {
    buyerModel.updateData({ payment: data.value as TPayment });
  } else if (data.field === 'address') {
    buyerModel.updateData({ address: data.value });
  } else if (data.field === 'email') {
    buyerModel.updateData({ email: data.value });
  } else if (data.field === 'phone') {
    buyerModel.updateData({ phone: data.value });
  }

  const buyerData = buyerModel.getData();
  const validation = buyerModel.validate();

  // Обновляем форму заказа
  if (currentOrderForm) {
    currentOrderForm.payment = buyerData.payment || '';
    currentOrderForm.address = buyerData.address || '';
    const paymentValid = !validation.payment && !validation.address;
    currentOrderForm.valid = paymentValid;
    const orderErrors = [validation.payment, validation.address].filter(Boolean) as string[];
    currentOrderForm.errors = orderErrors;
  }

  // Обновляем форму контактов
  if (currentContactsForm) {
    currentContactsForm.email = buyerData.email || '';
    currentContactsForm.phone = buyerData.phone || '';
    const contactsValid = !validation.email && !validation.phone;
    currentContactsForm.valid = contactsValid;
    const contactsErrors = [validation.email, validation.phone].filter(Boolean) as string[];
    currentContactsForm.errors = contactsErrors;
  }
});

// Открытие формы заказа
events.on("order:open", () => {
  modal.content = currentOrderForm.render();
  modal.open();
  });

// Переход к форме контактов
events.on("order:submit", () => {
  const validation = buyerModel.validate();
  if (!validation.payment && !validation.address) {
    modal.content = currentContactsForm.render();
    modal.open();
  }
});

// Отправка заказа
events.on("contacts:submit", () => {
  const buyerData = buyerModel.getData();
  const validation = buyerModel.validate();

  if (!validation.email && !validation.phone) {
    const orderData = {
      ...buyerData,
      items: cart.getCartItems().map((item) => item.id),
      total: cart.getTotalPrice(),
    };

    apiService.orderProducts(orderData)
      .then(() => {
        success.total = cart.getTotalPrice();
        modal.content = success.render();
        modal.open();

        buyerModel.clearData();
        cart.clearCart();
        events.emit('shopping-cart:changed');
      })
      .catch((error) => {
        console.error("Ошибка при оформлении заказа:", error);
      });
    }
});