import './scss/styles.scss';
import { IProduct, IProductsResponse, IBuyerValidationErrors, IBuyer} from './types/index';
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

// Загрузка товаров с сервера
apiService
  .getProducts()
  .then((result: IProductsResponse) => {
    console.log('Товары получены с сервера');
    productsModel.setItems(result.items);
    events.emit('products:updated');
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
});

// Выбор товара — устанавливаем выбранный товар и эмиттим событие
events.on('card:selected', (item: IProduct) => {
  productsModel.setSelectedProduct(item);
  events.emit('product:selected', item);
});

// Открытие карточки товара с возможностью добавления/удаления из корзины
events.on('product:selected', (item: IProduct) => {
  const isInCart = cart.hasItem(item.id);

  const cardPreview = new CardPreview(
    cloneTemplate('#card-preview'),
    {
      onButtonClick: () => {
        if (isInCart) {
          events.emit('shopping-cart:remove', { id: item.id });
        } else if (item.price !== null && item.price !== undefined) {
          cart.addItem(item);
          events.emit('shopping-cart:changed');
        }
        modal.close();
      },
    }
  );

  
  modal.content = cardPreview.render({
    title: item.title,
    price: item.price,
    image: item.image,
    category: item.category,
    description: item.description,
  });

  cardPreview.setPurchaseOpportunity(isInCart, item.price);
  modal.open();
});


//Корзина

events.on('shopping-cart:changed', () => {
  header.counter = cart.getItemCount();

  const cartItems = cart.getCartItems()
    .map((item, index) => {
      const cardBasket = new CardBasket(cloneTemplate('#card-basket'));

      // Рендерим карточку с данными товара
      const renderedElement = cardBasket.render({
        id: item.id,
        title: item.title,
        price: item.price,
        index: index + 1,
      });

      // Привязываем обработчик удаления к кнопке в карточке
      cardBasket.setDeleteHandler(() => {
        events.emit('shopping-cart:remove', { id: item.id });
      });

      return renderedElement;
    });

  basket.items = cartItems;
  basket.price = cart.getTotalPrice() || 0;
  const isEmpty = cart.getItemCount() === 0;
  basket.setPurchaseOpportunity(isEmpty);
});

// Обработчик открытия корзины
events.on('shopping-cart:opened', (data: { isEmpty: boolean }) => {
  basket.setPurchaseOpportunity(data.isEmpty);
  modal.content = basket.render();
  modal.open();
});


// Формы

events.on('buyer-data:updated', (data: {
  data: IBuyer;
  validation: IBuyerValidationErrors;
  field: string
}) => {
  const buyerData = data.data;
  const validation = data.validation;

  // Обновление формы заказа
  if (data.field === 'payment' || data.field === 'address' || data.field === 'all') {
    if (currentOrderForm) {
      currentOrderForm.payment = buyerData.payment || '';
      currentOrderForm.address = buyerData.address;
      const paymentValid = !validation.payment && !validation.address;
      currentOrderForm.valid = paymentValid;
      const orderErrors = [validation.payment, validation.address].filter(Boolean) as string[];
      currentOrderForm.errors = orderErrors;
    }
  }

  // Обновление формы контактов
  if (data.field === 'email' || data.field === 'phone' || data.field === 'all') {
    if (currentContactsForm) {
      currentContactsForm.email = buyerData.email;
      currentContactsForm.phone = buyerData.phone;
      const contactsValid = !validation.email && !validation.phone;
      currentContactsForm.valid = contactsValid;
      const contactsErrors = [validation.email, validation.phone].filter(Boolean) as string[];
      currentContactsForm.errors = contactsErrors;
    }
  }
});


events.on("order:open", () => {
  modal.content = currentOrderForm.render();
  events.emit("buyer-data:changed", { field: "all" });
});

events.on("order:submit", () => {
  modal.content = currentContactsForm.render();
  events.emit("buyer-data:changed", { field: "all" });
});

events.on("contacts:submit", () => {
  const orderData = {
    ...buyerModel.getData(),
    items: cart.getCartItems().map((item) => item.id),
    total: cart.getTotalPrice(),
  };
  

    apiService.orderProducts(orderData)
    .then(() => {
      const success = new Success(cloneTemplate("#success"), {
        onClick: () => {
          modal.close();
        },
      });
      success.total = cart.getTotalPrice();
      modal.content = success.render();

      buyerModel.clearData();
      cart.clearCart();
      events.emit('shopping-cart:changed');
    })
    .catch((error) => {
      console.error("Ошибка при оформлении заказа:", error);
    });
});