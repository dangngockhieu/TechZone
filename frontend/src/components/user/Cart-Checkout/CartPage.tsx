import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { setCartCount } from "../../../redux/slices/cartSlice";
import {
  getCart,
  updateCartQuantity,
  deleteCartItem,
} from "../../../services/apiServices";
import "./CartPage.scss";
import { toast } from "react-toastify";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import type { AppDispatch } from "../../../redux/store";
import type { CartItem, Item } from "../../../interfaces";
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

/* ===================== DEBOUNCE HOOK ===================== */
const useDebounce = <Args extends unknown[]>(
  callback: (...args: Args) => void | Promise<void>,
  delay: number
) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: Args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
};

/* ===================== COMPONENT ===================== */
const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const confirmedQuantities = useRef<Record<number, number>>({});

  /* ===================== FETCH CART ===================== */
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await getCart();
        if (res?.data?.success) {
          const items: CartItem[] = res?.data?.data?.cartItems || [];
          setCartItems(items);

          // Dispatch total cart count to Redux
          dispatch(setCartCount(items.length));

          items.forEach((item) => {
            confirmedQuantities.current[item.id] = item.number;
          });

          // Reset selected items when page loads
          setSelectedItems([]);
        }
      } catch (error) {
        console.error("Fetch cart error:", error);
      }
    };

    fetchCart();
  }, [dispatch]);

  /* ===================== SYNC QUANTITY ===================== */
  const syncQuantityToServer = useCallback(
    async (productID: number, newNumber: number) => {
      // Validate number before sending to server
      if (!Number.isInteger(newNumber) || newNumber < 1 || isNaN(newNumber)) {
        console.error("Invalid quantity:", newNumber);
        return;
      }

      if (confirmedQuantities.current[productID] === newNumber) return;

      try {
        const res = await updateCartQuantity(productID, newNumber);

        if (res?.data?.success) {
          confirmedQuantities.current[productID] = newNumber;
        } else {
          const confirmed =
            res?.data?.confirmedNumber ??
            confirmedQuantities.current[productID];

          toast.error(res?.data?.message || "Lỗi cập nhật giỏ hàng");

          setCartItems((prev) =>
            prev.map((item) =>
              item.id === productID
                ? { ...item, number: confirmed }
                : item
            )
          );

          confirmedQuantities.current[productID] = confirmed;
        }
      } catch {
        toast.error("Lỗi kết nối, hoàn lại số lượng cũ");
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === productID
              ? { ...item, number: confirmedQuantities.current[productID] }
              : item
          )
        );
      }
    },
    []
  );

  const debouncedSync = useDebounce(syncQuantityToServer, 3000);

  /* ===================== QUANTITY HANDLERS ===================== */
  const updateQuantity = (id: number, newNumber: number) => {
    // Validate and ensure newNumber is a valid positive integer
    if (!Number.isInteger(newNumber) || newNumber < 1 || isNaN(newNumber)) {
      console.error("Invalid quantity:", newNumber);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, number: newNumber } : item
      )
    );
    debouncedSync(id, newNumber);
  };

  const handleIncrease = (id: number) => {
    const item = cartItems.find((i) => i.id === id);
    if (item && !isNaN(item.number)) {
      updateQuantity(id, item.number + 1);
    }
  };

  const handleDecrease = (id: number) => {
    const item = cartItems.find((i) => i.id === id);
    if (item && item.number > 1 && !isNaN(item.number)) {
      updateQuantity(id, item.number - 1);
    }
  };

  /* ===================== SELECT ===================== */
  const handleSelect = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.id));
    }
  };

  /* ===================== DELETE ===================== */
  const handleDelete = async (id: number) => {
    try {
      const res = await deleteCartItem(id);
      if (res?.data?.success) {
        const updatedItems = cartItems.filter((item) => item.id !== id);
        setCartItems(updatedItems);
        setSelectedItems((prev) => prev.filter((x) => x !== id));
        dispatch(setCartCount(updatedItems.length));
        toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
      } else {
        toast.error(res?.data?.message || "Lỗi xóa sản phẩm");
      }
    } catch (error) {
      toast.error("Lỗi kết nối khi xóa sản phẩm");
      console.error(error);
    }
  };

  /* ===================== TOTAL ===================== */
  const total = cartItems
    .filter((item) => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.price * item.number, 0);

  /* ===================== CHECKOUT ===================== */
  const handleCheckout = () => {
    const checkoutItems: Item[] = cartItems
      .filter((item) => selectedItems.includes(item.id))
      .map((item) => ({
        id: item.id,
        number: item.number,
        price: item.price,
        name: item.name,
        imageUrl: item.imageUrl,
      }));

    navigate("/checkout", {
      state: {
        checkoutItems,
        totalAmount: total,
      },
    });
  };

  /* ===================== RENDER ===================== */
  return (
    <div className="cart-page">
      <div className="cart-left">
        <div className="cart-select-all">
          <input
            type="checkbox"
            checked={
              selectedItems.length === cartItems.length &&
              cartItems.length > 0
            }
            onChange={handleSelectAll}
          />
          <span>Chọn tất cả ({selectedItems.length})</span>
        </div>

        {cartItems.map((item) => (
          <div className="cart-item" key={item.id}>
            <input
              type="checkbox"
              checked={selectedItems.includes(item.id)}
              onChange={() => handleSelect(item.id)}
              disabled={item.quantity === 0}
            />

            <img src={item.imageUrl ? (item.imageUrl.startsWith("/") ? `${BASE_URL}${item.imageUrl}` : `${BASE_URL}/${item.imageUrl}`) : ''} alt={item.name} />

            <div className="cart-info">
              <div className="product-text-info">
                <h4>{item.name}</h4>

                {item.quantity > 0 ? (
                  <div className="cart-price">
                    <span className="current">
                      {item.price.toLocaleString()}₫
                    </span>
                    {item.originalPrice && (
                      <span className="old">
                        {item.originalPrice.toLocaleString()}₫
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="out-of-stock">Hết hàng</span>
                )}
              </div>

              <div className="cart-actions">
                <div className="quantity-control">
                  <button
                    onClick={() => handleDecrease(item.id)}
                    disabled={item.number <= 1 || item.quantity === 0}
                  >
                    -
                  </button>
                  <span>{item.number}</span>
                  <button
                    onClick={() => handleIncrease(item.id)}
                    disabled={item.quantity === 0}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <button className="delete-btn" onClick={() => handleDelete(item.id)}>
              <RiDeleteBin6Fill size={22} />
            </button>
          </div>
        ))}
      </div>

      <div className="cart-right">
        <h3>Thông tin đơn hàng</h3>
        <div className="summary-row">
          <span>Tổng tiền</span>
          <strong>{total.toLocaleString()}₫</strong>
        </div>
        <button
          className="checkout-btn"
          disabled={selectedItems.length === 0}
          onClick={handleCheckout}
        >
          Xác nhận đơn hàng
        </button>
      </div>
    </div>
  );
};

export default CartPage;
