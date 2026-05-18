import { Products } from './components/Models/Products';
import { Cart } from './components/Models/Cart';
import { Buyer } from './components/Models/Buyer';
import { ApiService } from './components/Services/ApiService';
import { apiProducts } from './utils/data';
import { API_URL } from './utils/constants';
import { Api } from './components/base/Api';

// Создание экземпляров классов
const productsModel = new Products();
const cartModel = new Cart();
const buyerModel = new Buyer();

console.log('=== ТЕСТИРОВАНИЕ КЛАССА PRODUCTS ===');

// 1. Тестирование сохранения и получения массива товаров
console.log('\n1. Сохранение и получение массива товаров:');
productsModel.setItems(apiProducts.items);
const items = productsModel.getItems();
console.log('Массив товаров из каталога:', productsModel.getItems());

// 2. Тестирование получения товара по ID
console.log('\n2. Получение товара по ID:');
const firstProduct = items[0];
const foundProduct = productsModel.getProductById(firstProduct.id);
console.log('Найден товар по ID:', foundProduct?.title);

// 3. Тестирование выбора и получения выбранного товара
console.log('\n3. Выбор и получение выбранного товара:');
productsModel.setSelectedProduct(firstProduct);
const selectedProduct = productsModel.getSelectedProduct();
console.log('Выбранный товар:', selectedProduct?.title);

console.log('\n=== ТЕСТИРОВАНИЕ КЛАССА CART ===');

// 1. Тестирование добавления товара в корзину
console.log('\n1. Добавление товара в корзину:');
cartModel.addItem(firstProduct);
console.log('Товар добавлен в корзину:', firstProduct.title);
console.log('Товары в корзине:', cartModel.getCartItems());

// 2. Тестирование проверки наличия товара
console.log('\n2. Проверка наличия товара в корзине:');
console.log('Товар в корзине:', cartModel.hasItem(firstProduct.id));

// 3. Тестирование общей стоимости
console.log('\n3. Общая стоимость товаров:');
console.log('Общая стоимость:', cartModel.getTotalPrice());

// 4. Тестирование количества товаров
console.log('\n4. Количество товаров в корзине:');
console.log('Количество:', cartModel.getItemCount());

// 5. Тестирование удаления товара
console.log('\n5. Удаление товара из корзины:');
cartModel.removeItem(firstProduct.id);
console.log('Товар удалён. Текущая корзина:', cartModel.getCartItems());
console.log('Количество после удаления:', cartModel.getItemCount());

// 6. Тестирование очистки корзины
console.log('\n6. Очистка корзины:');
cartModel.addItem(firstProduct); // добавляем обратно для теста
cartModel.clearCart();
console.log('Корзина очищена. Текущая корзина:', cartModel.getCartItems());

console.log('\n=== ТЕСТИРОВАНИЕ КЛАССА BUYER ===');

// 1. Тестирование обновления данных покупателя
console.log('\n1. Обновление данных покупателя:');
buyerModel.updateData({
  payment: 'card',
  email: 'test@example.com',
  phone: '+79991234567',
  address: 'г. Москва, ул. Примерная, д. 1'
});
console.log('Данные покупателя обновлены:', buyerModel.getData());

// 2. Тестирование валидации (все поля заполнены)
console.log('\n2. Валидация с заполненными полями:');
const validationResult1 = buyerModel.validate();
console.log('Ошибки валидации:', validationResult1);
console.log('Валидация прошла успешно:', Object.keys(validationResult1).length === 0);

// 3. Тестирование валидации (не все поля заполнены)
console.log('\n3. Валидация с неполными данными:');
buyerModel.clearData();
buyerModel.updateData({ email: 'test@example.com' });
const validationResult2 = buyerModel.validate();
console.log('Ошибки валидации:', validationResult2);
console.log('Есть ошибки валидации:', Object.keys(validationResult2).length > 0);

// 4. Тестирование очистки данных
console.log('\n4. Очистка данных покупателя:');
buyerModel.clearData();
console.log('Данные после очистки:', buyerModel.getData());


//  Тестирование взаимодейсвия с сервером
console.log('\n=== ТЕСТИРОВАНИЕ ВЗАИМОДЕЙСТВИЯ С СЕРВЕРОМ ===');
const apiClient = new Api(API_URL);
const apiService = new ApiService(apiClient);
const products = new Products();

async function loadProducts() {
  try {
    const productList = await apiService.getProducts();
    products.setItems(productList);
    console.log('Товары успешно загружены:', {
      count: productList.length,
      sample: productList
    });
  } catch (error) {
    console.error('Критическая ошибка загрузки товаров:', error);
  }
}
(async () => {
  await loadProducts();
  console.log('Тестирование завершено.');
})();