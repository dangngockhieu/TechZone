import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaStar, FaChevronDown, FaChevronUp, FaAngleDown } from "react-icons/fa6";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { setCartCount } from "../../../redux/slices/cartSlice";
import { addProductToCart, getNumberCart, getFilteredProducts, buyNow } from "../../../services/apiServices";
import { toast } from "react-toastify";
import acer from "../../../assets/acer.jpg";
import asus from "../../../assets/asus.jpg";
import dell from "../../../assets/dell.jpg";
import honor from "../../../assets/honor.jpg";
import hp from "../../../assets/hp.jpg";
import iphone from "../../../assets/iphone.jpg";
import lenovo from "../../../assets/lenovo.jpg";
import macbook from "../../../assets/macbook.jpg";
import msi from "../../../assets/msi.jpg";
import oppo from "../../../assets/oppo.jpg";
import realme from "../../../assets/realme.jpg";
import samsung from "../../../assets/samsung.jpg";
import vivo from "../../../assets/vivo.jpg";
import xiaomi from "../../../assets/xiaomi.jpg";
import header1 from "../../../assets/header1.jpg";
import header2 from "../../../assets/header2.jpg";
import header3 from "../../../assets/header3.jpg";
import header4 from "../../../assets/header4.jpg";
import header5 from "../../../assets/header5.jpg";
import header6 from "../../../assets/header6.jpg";
import header7 from "../../../assets/header7.jpg";
import header8 from "../../../assets/header8.jpg";
import header9 from "../../../assets/header9.jpg";
import header10 from "../../../assets/header10.jpg";

import "./Product.scss";

import type { ProductSummary } from "../../../interfaces";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

type ProductCategory = "LAPTOP" | "PHONE";

type Factory = { id: number; name: string; image: string };
type Feature = { id: number; name: string };
type OptionObj = { label: string; name: string | null };
type FilterOption = string | OptionObj;
type FilterMap = Record<string, FilterOption[]>;
type SelectedFilters = Record<string, Array<string | null>>;
type PriceRange = { min?: number; max?: number } | undefined;

const isOptionObj = (option: FilterOption): option is OptionObj =>
  typeof option === "object" && option !== null && "name" in option;

const FACTORIES: Factory[] = [
  { id: 1, name: "MACBOOK", image: macbook },
  { id: 2, name: "ASUS", image: asus },
  { id: 3, name: "MSI", image: msi },
  { id: 4, name: "DELL", image: dell },
  { id: 5, name: "HP", image: hp },
  { id: 6, name: "ACER", image: acer },
  { id: 7, name: "LENOVO", image: lenovo },
  { id: 8, name: "IPHONE", image: iphone },
  { id: 9, name: "SAMSUNG", image: samsung },
  { id: 10, name: "XIAOMI", image: xiaomi },
  { id: 11, name: "OPPO", image: oppo },
  { id: 12, name: "VIVO", image: vivo },
  { id: 13, name: "REALME", image: realme },
  { id: 14, name: "HONOR", image: honor },
];

const HEADERS_LAPTOP = [header1, header2, header3, header4, header5];
const HEADERS_PHONE = [header6, header7, header8, header9, header10];

const FEATURE_NAMES: Feature[] = [
  { id: 1, name: "Văn phòng" },
  { id: 2, name: "Gaming" },
  { id: 3, name: "Mỏng nhẹ" },
  { id: 4, name: "Đồ họa" },
  { id: 5, name: "Cảm ứng" },
  { id: 6, name: "Laptop AI" },
  { id: 7, name: "Điện thoại 5G" },
  { id: 8, name: "Điện thoại AI" },
  { id: 9, name: "Gaming Phone" },
  { id: 10, name: "Phổ thông 4G" },
  { id: 11, name: "Điện thoại gập" },
];

const LAPTOP_FILTERS: FilterMap = {
  CPU: [
    { label: "Tất cả", name: null },
    { label: "Intel Core i3", name: "i3" },
    { label: "Intel Core i5", name: "i5" },
    { label: "Intel Core i7", name: "i7" },
    { label: "AMD Ryzen 5", name: "ryzen5" },
    { label: "AMD Ryzen 7", name: "ryzen7" },
    { label: "Apple M2", name: "m2" },
    { label: "Apple M3", name: "m3" },
    { label: "Apple M4", name: "m4" },
    { label: "Apple M5", name: "m5" },
  ],
  RAM: ["Tất cả", "8GB", "12GB", "16GB", "24GB", "32GB", "64GB"],
  "Cạc đồ họa rời": [
    { label: "Tất cả", name: null },
    { label: "RTX 30 Series", name: "rtx30" }, 
    { label: "RTX 40 Series", name: "rtx40" },
    { label: "RTX 50 Series", name: "rtx50" },
  ],
  "Bộ nhớ": ["Tất cả", "256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD"],
  "Kích thước màn hình (inch)": [
    { label: "Tất cả", name: null },
    { label: "13.x", name: "13" }, 
    { label: "14.x", name: "14" },
    { label: "15.x", name: "15" },
    { label: "16.x", name: "16" },
    { label: "17.x", name: "17" },
  ],
};

const PHONE_FILTERS: FilterMap = {
  RAM: ["Tất cả", "3GB", "4GB", "6GB", "8GB", "12GB", "16GB"],
  "Bộ nhớ": ["Tất cả", "64GB", "128GB", "256GB", "512GB", "1TB"],
  "Màn Hình": ["Tất cả", "AMOLED", "OLED", "LCD"],
  "Kích thước màn hình (inch)": [
    { label: "Tất cả", name: null },
    { label: "5.x", name: "5" }, 
    { label: "6.x", name: "6" },
    { label: "7.x", name: "7" },
    { label: "8.x", name: "8" },
  ],
  "PIN (mAh)": [
    { label: "Tất cả", name: null },
    { label: "3000+", name: "3000" }, 
    { label: "4000+", name: "4000" },
    { label: "5000+", name: "5000" },
    { label: "6000+", name: "6000" },
    { label: "7000+", name: "7000" },
  ],
};

const LAPTOP_PRICE_OPTIONS = [
  { id: 1, label: "Tất cả", range: [null, null] },
  { id: 2, label: "Dưới 10 triệu", range: [0, 10000000] },
  { id: 3, label: "10 - 15 triệu", range: [10000000, 15000000] },
  { id: 4, label: "15 - 20 triệu", range: [15000000, 20000000] },
  { id: 5, label: "20 - 30 triệu", range: [20000000, 30000000] },
  { id: 6, label: "Trên 30 triệu", range: [30000000, null] },
];

const PHONE_PRICE_OPTIONS = [
  { id: 1, label: "Tất cả", range: [null, null] },
  { id: 2, label: "Dưới 5 triệu", range: [0, 5000000] },
  { id: 3, label: "5 - 10 triệu", range: [5000000, 10000000] },
  { id: 4, label: "10 - 20 triệu", range: [10000000, 20000000] },
  { id: 5, label: "20 - 30 triệu", range: [20000000, 30000000] },
  { id: 6, label: "Trên 30 triệu", range: [30000000, null] },
];

const Product = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.user);
  
  const navigate = useNavigate();
  const [category, setCategory] = useState<ProductCategory>("LAPTOP");
  const headers = useMemo(
    () => (category === "LAPTOP" ? HEADERS_LAPTOP : HEADERS_PHONE),
    [category]
  );
  const [currentBanner, setCurrentBanner] = useState<number>(0);

  const currentFactories = useMemo<Factory[]>(
    () => (category === "LAPTOP" ? FACTORIES.slice(0, 7) : FACTORIES.slice(7)),
    [category]
  );
  const currentPrices = useMemo(
    () => (category === "LAPTOP" ? LAPTOP_PRICE_OPTIONS : PHONE_PRICE_OPTIONS),
    [category]
  );
  const currentFeatures = useMemo<Feature[]>(
    () => (category === "LAPTOP" ? FEATURE_NAMES.slice(0, 6) : FEATURE_NAMES.slice(6)),
    [category]
  );

  const [visibleCount, setVisibleCount] = useState<number>(16);
  const [initialLaptops, setInitialLaptops] = useState<ProductSummary[]>([]);
  const [initialLaptopCount, setInitialLaptopCount] = useState<number>(0);
  const [initialPhones, setInitialPhones] = useState<ProductSummary[]>([]);
  const [initialPhoneCount, setInitialPhoneCount] = useState<number>(0);
  const [filteredProducts, setFilteredProducts] = useState<ProductSummary[] | null>(null);
  const [filteredCount, setFilteredCount] = useState<number | null>(null);
  const [selectedFactories, setSelectedFactories] = useState<number[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<number[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({});
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [customPrice, setCustomPrice] = useState<{ min: string; max: string }>({ min: "", max: "" });

  const [expandedSections, setExpandedSections] = useState<{
    brand: boolean;
    feature: boolean;
    price: boolean;
    specs: Record<string, boolean>;
  }>({
    brand: true,
    feature: true,
    price: true,
    specs: {},
  });


  const handleAddToCart = async (productID: number) => {
    if (!isAuthenticated) {
      toast.warning("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      return;
    }

    const res = await addProductToCart(productID);
    try{
      if (res?.data?.success) {
        toast.success("Đã thêm vào giỏ hàng!");
        const cartRes = await getNumberCart();
        if (cartRes?.data?.success) dispatch(setCartCount(cartRes.data.data.totalCart));
      } else {
        toast.error(res?.data?.message || "Không thể thêm vào giỏ hàng");
      }
    } catch {
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    }
  };

  const handleBuyNow = async (productID: number) => {
    if (!isAuthenticated) {
      toast.warning("Vui lòng đăng nhập để mua sản phẩm!");
      return;
    }

    const res = await buyNow(productID);
    try{
      if (res?.data?.success) {
        const cartRes = await getNumberCart();
        if (cartRes?.data?.data?.totalCart) dispatch(setCartCount(cartRes?.data?.data?.totalCart));
        navigate('/cart');
      } 
    } catch {
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    }
  };

  const toggleSection = (key: 'brand' | 'feature' | 'price') => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSpecSection = (key: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      specs: { ...prev.specs, [key]: !prev.specs[key] },
    }));
  };

  const handleNavigate = (p: { id: number }) => navigate(`/product/${p.id}`);

  const fetchProducts = async (
    type: ProductCategory,
    setData: React.Dispatch<React.SetStateAction<ProductSummary[]>>,
    setCountFn: React.Dispatch<React.SetStateAction<number>>
  ) => {
    try {
      const res = await getFilteredProducts(type, {});
      if (res?.data?.success) {
        setData(res?.data?.data?.products || []);
        setCountFn(res?.data?.data?.count || 0);
      }
      else {
        toast.error(`Lỗi tải sản phẩm`);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : `Error fetching ${type}`;
      toast.error(message);
    }
  };

  useEffect(() => {
    fetchProducts("LAPTOP", setInitialLaptops, setInitialLaptopCount);
    fetchProducts("PHONE", setInitialPhones, setInitialPhoneCount);
  }, []);

  const renderProducts = (list: ProductSummary[] = []) =>
    list.map((item) => {
      const imgUrl = item.imageUrls?.length
        ? (item.imageUrls[0].startsWith("/") ? `${BASE_URL}${item.imageUrls[0]}` : `${BASE_URL}/${item.imageUrls[0]}`)
        : "/no-image.png";
      const avgRating = Number(item.avgRating || 0).toFixed(2);
      const totalReviews = item.totalReviews || 0;
      const hasDiscount = item.coupon > 0;
      const newPrice = item.price?.toLocaleString("vi-VN") + "đ";
      const oldPrice = item.originalPrice?.toLocaleString("vi-VN") + "đ";

      return (
        <div key={item.id} className="product-card">
          {hasDiscount && <div className="discount">-{item.coupon}%</div>}
          <img src={imgUrl} alt={item.name} onClick={() => handleNavigate(item)} style={{ cursor: "pointer" }} />
          <div className="info">
            <div className="rating">
              <FaStar className="star" /> {avgRating} <span>({totalReviews})</span>
            </div>
            <h3>{item.name}</h3>
            <div className={`price ${!hasDiscount ? "center" : ""}`}>
              <span className="new">{newPrice}</span>
              {hasDiscount && <span className="old">{oldPrice}</span>}
            </div>
            <div className="actions">
              <button className="add-cart" onClick={() => handleAddToCart(item.id)}>
                Add To Cart
              </button>
              <button className="buy-now" onClick={() => handleBuyNow(item.id)}>
                Buy Now
              </button>
            </div>
          </div>
        </div>
      );
    });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % headers.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [headers.length]);

  const currentFilters: FilterMap = category === "LAPTOP" ? LAPTOP_FILTERS : PHONE_FILTERS;
  const filterKeys = Object.keys(currentFilters);
  const defaultProducts = category === "LAPTOP" ? initialLaptops : initialPhones;
  const defaultCount = category === "LAPTOP" ? initialLaptopCount : initialPhoneCount;
  const products = filteredProducts ?? defaultProducts;
  const count = filteredCount ?? defaultCount;

  const toggleOption = (key: string, value: string | null) => {
    setSelectedFilters((prev) => {
      const current = prev[key] || [];

      if (key === "CPU" || key === "Cạc đồ họa rời" || key ==="Kích thước màn hình (inch)" || key ==="PIN (mAh)") {
        const isAll = value === null || value === "all";
        if (isAll) {
          return { ...prev, [key]: [null] };
        }
        const cleaned = current.filter((v: string | null) => v !== null && v !== "all");
        const updated = cleaned.includes(value)
          ? cleaned.filter((v: string | null) => v !== value)
          : [...cleaned, value];
        return { ...prev, [key]: updated };
      }

      const isAll = value === "Tất cả";
      if (isAll) {
        return { ...prev, [key]: ["Tất cả"] };
      }
      const cleaned = current.filter((v: string | null) => v !== "Tất cả");
      const updated = cleaned.includes(value)
        ? cleaned.filter((v: string | null) => v !== value)
        : [...cleaned, value];
      return { ...prev, [key]: updated };
    });
  };

  const handleFilter = async () => {
    setVisibleCount(16);
    const processedSpecs: SelectedFilters = { ...selectedFilters };
    
    if (processedSpecs.CPU && processedSpecs.CPU.length > 0) {
      const cpuOptions = LAPTOP_FILTERS.CPU.filter(isOptionObj);
      processedSpecs.CPU = processedSpecs.CPU.map((v: string | null) => {
        const found = cpuOptions.find((opt) => opt.name === v);
        return found ? found.label : v;
      });
    }

    if (processedSpecs["PIN (mAh)"] && processedSpecs["PIN (mAh)"].length > 0) {
      const pinOptions = PHONE_FILTERS["PIN (mAh)"].filter(isOptionObj);
      processedSpecs["PIN (mAh)"] = processedSpecs["PIN (mAh)"].map((v: string | null) => {
        const found = pinOptions.find((opt) => opt.name === v);
        return found ? found.label : v;
      });
    }

    if (processedSpecs["Cạc đồ họa rời"] && processedSpecs["Cạc đồ họa rời"].length > 0) {
      const gpuOptions = LAPTOP_FILTERS["Cạc đồ họa rời"].filter(isOptionObj);
      processedSpecs["Cạc đồ họa rời"] = processedSpecs["Cạc đồ họa rời"].map((v: string | null) => {
        const found = gpuOptions.find((opt) => opt.name === v);
        return found ? found.label : v;
      });
    }

    if (processedSpecs["Kích thước màn hình (inch)"]?.length > 0) {
      const source = category === "LAPTOP"
        ? LAPTOP_FILTERS["Kích thước màn hình (inch)"]
        : PHONE_FILTERS["Kích thước màn hình (inch)"];
      const sizeOptions = source.filter(isOptionObj);

      processedSpecs["Kích thước màn hình (inch)"] = processedSpecs["Kích thước màn hình (inch)"].map((v: string | null) => {
        const found = sizeOptions.find((opt) => opt.name === v);
        return found ? found.label : v;
      });
    }

    const normalizeSpecs = (filters: SelectedFilters) => {
      const mapped: SelectedFilters = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (key === "Cạc đồ họa rời") mapped["GPU"] = value;
        else if (key === "Bộ nhớ") mapped["Storage"] = value;
        else if (key === "Kích thước màn hình (inch)") mapped["ScreenSize"] = value;
        else if (key === "PIN (mAh)") mapped["PIN"] = value;
        else if (key === "Màn Hình") mapped["Screen"] = value;
        else mapped[key] = value;
      });
      return mapped;
    };

    const factories = selectedFactories
      .map((id) => currentFactories.find((b) => b.id === id)?.name)
      .filter((name): name is string => Boolean(name));
    const product_features = selectedFeatures
      .map((id) => currentFeatures.find((f) => f.id === id)?.id)
      .filter((id): id is number => typeof id === "number");

    const customPriceRange: PriceRange =
      customPrice.min || customPrice.max
        ? {
            min: customPrice.min ? Number(customPrice.min) : undefined,
            max: customPrice.max ? Number(customPrice.max) : undefined,
          }
        : undefined;

    const selectedPriceOption =
      selectedPrice !== null
        ? currentPrices.find((p) => p.id === selectedPrice)
        : undefined;

    const selectedPriceRange: PriceRange = selectedPriceOption
      ? {
          min: selectedPriceOption.range[0] ?? undefined,
          max: selectedPriceOption.range[1] ?? undefined,
        }
      : undefined;

    const filters = {
      factories,
      product_features,
      specs: normalizeSpecs(selectedFilters),
      price: customPriceRange ?? selectedPriceRange,
    };

    try {
      const res = await getFilteredProducts(category, filters);
      if (res?.data?.success && res?.data?.data) {
        setFilteredProducts(res?.data?.data?.products || []);
        setFilteredCount(res?.data?.data?.count || 0);
      } else {
        setFilteredProducts([]);
        setFilteredCount(0);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Filter error";
      toast.error(message);
    }
  };

  const handleReset = () => {
    setSelectedFactories([]);
    setSelectedFeatures([]);
    const resetFilters: SelectedFilters = {};
    Object.keys(currentFilters).forEach((key) => (resetFilters[key] = []));
    setSelectedFilters(resetFilters);
    setSelectedPrice(null);
    setCustomPrice({ min: "", max: "" });
    setFilteredProducts(null);
    setFilteredCount(null);
    setVisibleCount(16);
  };

  const handleCategoryChange = (nextCategory: ProductCategory) => {
    setCategory(nextCategory);
    setSelectedFactories([]);
    setSelectedFeatures([]);
    setSelectedFilters({});
    setSelectedPrice(null);
    setCustomPrice({ min: "", max: "" });
    setFilteredProducts(null);
    setFilteredCount(null);
    setVisibleCount(16);
    setCurrentBanner(0);
  };

  const toggleFactory = (id: number) => {
    setSelectedFactories((p) => (p.includes(id) ? p.filter((b) => b !== id) : [...p, id]));
  };
  const toggleFeature = (id: number) => {
    setSelectedFeatures((p) => (p.includes(id) ? p.filter((f) => f !== id) : [...p, id]));
  };

  const handlePriceSelect = (id: number) => {
    setSelectedPrice((p) => (p === id ? null : id));
    setCustomPrice({ min: "", max: "" });
  };

  const handleClickInputMin = (e: React.ChangeEvent<HTMLInputElement>) =>
    setCustomPrice({ ...customPrice, min: e.target.value });
  const handleClickInputMax = (e: React.ChangeEvent<HTMLInputElement>) =>
    setCustomPrice({ ...customPrice, max: e.target.value });

  return (
    <div className="product-page">
      <div className="category-toggle">
        <button className={category === "LAPTOP" ? "active" : ""} onClick={() => handleCategoryChange("LAPTOP")}>
          Laptop
        </button>
        <button className={category === "PHONE" ? "active" : ""} onClick={() => handleCategoryChange("PHONE")}>
          Phone
        </button>
      </div>

      <div className="header__hero-image">
        <img src={headers[currentBanner]} alt="Banner" />
      </div>
      <div className="banner-dots external">
          {headers.map((_, i) => (
            <span key={i} className={`dot ${currentBanner === i ? "active" : ""}`} onClick={() => setCurrentBanner(i)}></span>
          ))}
      </div>

      <div className="main-content">
        <div className="filter-section">
          <div className="filter-header">
            <h3>Bộ lọc chi tiết</h3>
            <div className="filter-buttons">
              <button className="btn-filter" onClick={handleFilter}>Lọc</button>
              <button className="btn-reset" onClick={handleReset}>Reset</button>
            </div>
          </div>
          <hr/>
          <div className="filter-divider">
            <div className="filter-item">
              <div className="filter-title" onClick={() => toggleSection("brand")}>
                <label>Hãng sản xuất</label>
                {expandedSections.brand ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {expandedSections.brand && (
                <div className="brand-grid">
                  {currentFactories.map((brand) => (
                    <div
                      key={brand.id}
                      className={`brand-item ${selectedFactories.includes(brand.id) ? "selected" : ""}`}
                      onClick={() => toggleFactory(brand.id)}
                    >
                      <img src={brand.image} alt={brand.name} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="filter-item">
              <div className="filter-title" onClick={() => toggleSection("feature")}>
                <label>Nhu cầu sử dụng</label>
                {expandedSections.feature ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {expandedSections.feature && (
                <div className="feature-grid">
                  {currentFeatures.map((f) => (
                    <div
                      key={f.id}
                      className={`feature-item ${selectedFeatures.includes(f.id) ? "selected" : ""}`}
                      onClick={() => toggleFeature(f.id)}
                    >
                      {f.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="filter-item">
              <div className="filter-title" onClick={() => toggleSection("price")}>
                <label>Khoảng giá (VNĐ)</label>
                {expandedSections.price ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {expandedSections.price && (
                <>
                  <div className="option-grid">
                    {currentPrices.map((p) => {
                      const isSelected =
                        selectedPrice === p.id ||
                        (p.label === "Tất cả" && selectedPrice === null);
                      return (
                        <div
                          key={p.id}
                          className={`option-item ${isSelected ? "selected" : ""}`}
                          onClick={() => handlePriceSelect(p.id)}
                        >
                          {p.label}
                        </div>
                      );
                    })}
                  </div>

                  <div className="price-inputs">
                    <input
                      type="number"
                      placeholder="Min"
                      value={customPrice.min}
                      onChange={(e) => handleClickInputMin(e)}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={customPrice.max}
                      onChange={(e) => handleClickInputMax(e)}
                    />
                  </div>
                </>
              )}
            </div>

            {filterKeys.map((key) => (
              <div className="filter-item" key={key}>
                <div className="filter-title" onClick={() => toggleSpecSection(key)}>
                  <label>{key}</label>
                  {expandedSections.specs[key] ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                {expandedSections.specs[key] && (
                  <div className="option-grid">
                    {currentFilters[key].map((option) => {
                      const display = typeof option === "object" ? option.label : option;
                      const value = typeof option === "object" ? option.name : option;
                      const isSelected = key === "CPU" || key === "Cạc đồ họa rời" || key === "Kích thước màn hình (inch)" || key ==="PIN (mAh)"
                        ? selectedFilters[key]?.includes(value) ||
                        (value === null && (!selectedFilters[key] || selectedFilters[key].length === 0))
                        : selectedFilters[key]?.includes(value) ||
                        (value === "Tất cả" && (!selectedFilters[key] || selectedFilters[key].length === 0));
                      return (
                        <div
                          key={value}
                          className={`option-item ${isSelected ? "selected" : ""}`}
                          onClick={() => toggleOption(key, value)}
                        >
                          {display}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="product-list">
          <h3>Tìm thấy: {count} sản phẩm</h3>
          <div className="product-grid">
            {count > 0 ? (renderProducts(products.slice(0, visibleCount))) : (<p>Không có sản phẩm thỏa mãn</p>)}
          </div>
          {products.length > visibleCount && (
            <div className="load-more-container">
              <button
                className="load-more-button"
                onClick={() =>
                  setVisibleCount((prev) => prev + 16)
                }
              >
                Xem thêm {Math.min(16, products.length - visibleCount)} sản phẩm <FaAngleDown className="load-more-icon" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Product;