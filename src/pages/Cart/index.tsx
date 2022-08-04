import React from 'react';
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from './styles';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

  const cartFormatted = cart.map(product => ({
    ...product,
      priceFormatted: formatPrice(product.price),
      subtotal: formatPrice((product.price*product.amount))
  }))
  const total =
    formatPrice(
      cart.reduce((sumTotal, product) => {
        return sumTotal + (product.price*product.amount)
      }, 0)
    )

  function handleProductIncrement(product: Product) {
    updateProductAmount({
      amount: (product.amount+1),
      productId: product.id,
      operation: 'add'
    })
  }

  function handleProductDecrement(product: Product) {
    updateProductAmount({
      amount: (product.amount-1),
      productId: product.id,
      operation: 'sub'
    })
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId)
    
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {
            cartFormatted.map(item => {
              return (
                <tr data-testid="product" key={item.id}>
                  <td>
                    <img src={item.image} alt={item.title} />
                  </td>
                  <td>
                    <strong>{item.title}</strong>
                    <span>{item.priceFormatted}</span>
                  </td>
                  <td>
                    <div>
                      <button
                        type="button"
                        data-testid="decrement-product"
                        disabled={item.amount <= 1}
                        onClick={() => handleProductDecrement(item)}
                      >
                        <MdRemoveCircleOutline size={20} />
                      </button>
                      <input
                        type="text"
                        data-testid="product-amount"
                        readOnly
                        value={item.amount}
                      />
                      <button
                        type="button"
                        data-testid="increment-product"
                        onClick={() => handleProductIncrement(item)}
                      >
                        <MdAddCircleOutline size={20} />
                      </button>
                    </div>
                  </td>
                  <td>
                    <strong>{item.subtotal}</strong>
                  </td>
                  <td>
                    <button
                      type="button"
                      data-testid="remove-product"
                      onClick={() => handleRemoveProduct(item.id)}
                    >
                      <MdDelete size={20} />
                    </button>
                  </td>
                </tr>
              )
            })
          }
          {
            cartFormatted.length===0 && <tr>
              <td colSpan={4} style={{textAlign: 'center'}}><h2>Sem itens no carrinho</h2> </td>
              </tr>
          }
        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
