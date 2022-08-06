import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    
    try {
      const productCartFinded = cart.find(item=> item.id===productId);
      if(productCartFinded){
        updateProductAmount({
          productId: productCartFinded.id,
          amount: (productCartFinded.amount+1),
        })
      }else{
        const dataProduct = await api.get<Product[]>('/products',{params:{id: productId}});
        const data = [
          ...cart,
          {
            ...dataProduct.data[0],
            amount: 1,
          }
        ]
        
        setCart(data)
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(data))
      }
      
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const newCart = [...cart];
      const index = cart.findIndex(item=> item.id===productId)
      if(index>=0){
        newCart.splice(index, 1)
        setCart(newCart);
        localStorage.setItem('@RocketShoes:cart',JSON.stringify(newCart));
      }else{
        throw Error()
      }
      
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const dataStock = await api.get<Stock[]>('/stock',{params:{id: productId}});
      let stock = dataStock.data[0].amount;

      if( ((amount) > stock)){
        toast.error('Quantidade solicitada fora de estoque');
      }else{
       const newCart = cart.map(item=>{
          if(item.id===productId){
            item.amount=amount;
          }
          return item;
       })
       setCart(newCart);
       localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
      }

    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
