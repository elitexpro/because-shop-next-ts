import { useEffect, useReducer, useState } from 'react';
import Cookies from 'js-cookie';

import { CartActionType, CartContext, cartReducer } from './';
import { TesloConstantKey, tesloConstants } from '@/shared/constants';
import { ICartProduct, IOrderSummary, IShippingAddress } from '@/interfaces';

export interface CartState {
  cart: ICartProduct[];
  orderSummary: IOrderSummary;
  shippingAddress?: IShippingAddress;
}

interface CartProviderProps {
  children: React.ReactNode;
}

const CART_INIT_STATE: CartState = {
  cart: [],
  orderSummary: {
    numberOfItems: 0,
    subTotal: 0,
    tax: 0,
    total: 0,
  },
  shippingAddress: undefined,
};

export const CartProvider = ({ children }: CartProviderProps) => {
  const [state, dispatch] = useReducer(cartReducer, CART_INIT_STATE);

  // // "isMounted" ensures that the status will NOT be Updated if the initialization has not yet been executed
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    try {
      if (!isMounted) {
        const cart = JSON.parse(Cookies.get('cart') ?? '[]');

        dispatch({
          type: CartActionType.loadCartFromCookiesOrStorage,
          payload: cart,
        });

        setIsMounted(true);
      }
    } catch (error) {
      // proteccion in case of cookie manipulation
      dispatch({
        type: CartActionType.loadCartFromCookiesOrStorage,
        payload: [],
      });

      Cookies.set('cart', JSON.stringify([]));
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) Cookies.set('cart', JSON.stringify(state.cart));
  }, [state.cart, isMounted]);
  // // end - load cart from cookies

  // // orderSummary
  useEffect(() => {
    if (!isMounted) return;

    const subTotal = state.cart.reduce(
      (acc, { price, quantity }) => acc + price * quantity,
      0
    );
    const taxRate = tesloConstants.get(TesloConstantKey.taxtRate) || 0.12;
    const tax = subTotal * taxRate;

    const orderSummary: IOrderSummary = {
      numberOfItems: state.cart.reduce(
        (acc, itemInCart) => acc + itemInCart.quantity,
        0
      ),
      subTotal,
      tax,
      total: subTotal + tax,
    };

    dispatch({
      type: CartActionType.updateOrderSummary,
      payload: orderSummary,
    });
  }, [isMounted, state.cart]);

  // // shippingAddress from cookies
  useEffect(() => {
    if (!isMounted || !Cookies.get('checkoutAddress')) return;

    dispatch({
      type: CartActionType.loadAddressFromCookie,
      payload: JSON.parse(Cookies.get('checkoutAddress') || '{}'),
    });
  }, [isMounted]);

  const addProductToCart = (productToAdd: ICartProduct) => {
    const updatedProductCart = [...state.cart];
    const foundProduct = updatedProductCart.find(
      ({ _id, size }) => _id === productToAdd._id && size === productToAdd.size
    );

    if (foundProduct) foundProduct.quantity += productToAdd.quantity;
    else updatedProductCart.push(productToAdd);

    dispatch({
      type: CartActionType.updateProductsInCart,
      payload: updatedProductCart,
    });
  };

  const updateCartQuantity = (product: ICartProduct) => {
    dispatch({ type: CartActionType.updateCartQuantity, payload: product });
  };

  const removeProductFromCart = (product: ICartProduct) => {
    dispatch({ type: CartActionType.removeProductoFromCart, payload: product });
  };

  const updateShippingAddress = (address: IShippingAddress) => {
    Cookies.set(
      'checkoutAddress',
      JSON.stringify({
        ...address,
        address2: address.address2 || '',
      })
    );

    dispatch({ type: CartActionType.updateShippingAddress, payload: address });
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        isMounted,

        // methods
        addProductToCart,
        updateCartQuantity,
        removeProductFromCart,
        updateShippingAddress,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
