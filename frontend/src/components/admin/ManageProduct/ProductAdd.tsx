import { useState, useRef } from "react";
import {
  createProduct,
  addProductFeatures,
} from "../../../services/apiServices";
import { toast } from "react-toastify";
import { RiFolderUploadFill } from "react-icons/ri";
import { IoMdClose } from "react-icons/io";
import "./ProductAdd.scss";

const FEATURE_NAMES = [
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

const ProductAdd = ({ show, setShow, onRefresh }
  : {show: boolean; setShow: React.Dispatch<React.SetStateAction<boolean>>; onRefresh: () => void}) => {
  const initForm = {
    name: "",
    originalPrice: 0,
    coupon: 0,
    quantity: 0,
    infor: "",
    warranty: "",
    cpu: "",
    ram: "",
    storage: "",
    screen: "",
    graphicsCard: "",
    battery: "",
    weight: "",
    releaseYear: "",
    category: "",
    factory: "",
  };

  const [form, setForm] = useState(initForm);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [tempFeatures, setTempFeatures] = useState<number[]>([]);
  const handleClose = () => {
    setShow(false);
    setForm(initForm);
    setImages([]);
    setPreviewUrls([]);
    setErrors({});
    setTempFeatures([]);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const newForm = { ...prev, [name]: value };
      if (name === "category") newForm.factory = "";
      return newForm;
    });
    setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const allFiles = [...images, ...files];
    setImages(allFiles as Array<File>);

    const urls = allFiles.map((f) => URL.createObjectURL(f));
    previewUrls.forEach((u) => URL.revokeObjectURL(u));
    setPreviewUrls(urls);
    e.target.value = "";
  };

  const removePreview = (index: number) => {
    const newFiles = [...images];
    const newPreview = [...previewUrls];
    URL.revokeObjectURL(newPreview[index]);
    newFiles.splice(index, 1);
    newPreview.splice(index, 1);
    setImages(newFiles);
    setPreviewUrls(newPreview);
  };

  const validateForm = () => {
    const required = [
      "name",
      "originalPrice",
      "quantity",
      "warranty",
      "cpu",
      "ram",
      "storage",
      "battery",
      "releaseYear",
      "category",
      "factory",
    ];
    const newErr: Record<string, boolean> = {};
    required.forEach((key) => {
      if (!form[key as keyof typeof form]) newErr[key] = true;
    });
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const toggleFeature = (id: number) => {
    setTempFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => fd.append(key, String(val)));
      images.forEach((img) => fd.append("images", img));

      const res = await createProduct(fd);
      if (res && res?.data && res.data.success) {
        const newProductId = res.data?.product?.id;
        if (newProductId && tempFeatures.length > 0)
          await addProductFeatures(newProductId, tempFeatures);

        toast.success("Thêm sản phẩm thành công!");
        onRefresh();

        previewUrls.forEach((u) => URL.revokeObjectURL(u));
        setForm(initForm);
        setImages([]);
        setPreviewUrls([]);
        setTempFeatures([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setShow(false);
      } else toast.error(res?.data?.message || "Thêm thất bại");
    } catch {
      toast.error("Lỗi khi thêm sản phẩm");
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      
      <div className="modal-box">
        <button className="modal-close-btn" onClick={handleClose}>
          <IoMdClose />
        </button>
        <h4>Thêm sản phẩm mới</h4>
        <form onSubmit={handleSubmit} className="form-add-product">
          {Object.entries({
            name: "Tên sản phẩm",
            originalPrice: "Giá gốc",
            coupon: "Giảm giá (%)",
            quantity: "Số lượng",
            warranty: "Bảo hành",
            cpu: "CPU",
            ram: "RAM",
            storage: "Bộ nhớ",
            screen: "Màn hình",
            graphicsCard: "Card đồ họa",
            battery: "Pin",
            weight: "Trọng lượng",
            releaseYear: "Năm phát hành",
          }).map(([key, label]) => (
            <div className="form-group" key={key}>
              <label htmlFor={key}>{label}</label>
              <input
                id={key}
                name={key}
                value={form[key as keyof typeof form]}
                onChange={handleChange}
                placeholder={label}
                className={errors[key] ? "error" : ""}
              />
            </div>
          ))}

          <div className="form-group">
            <label htmlFor="infor">Thông tin thêm</label>
            <textarea
              id="infor"
              name="infor"
              value={form.infor}
              onChange={handleChange}
              placeholder="Thông tin sản phẩm..."
              rows={4}
            />
          </div>

          <div className="select-row">
            <div className="form-group">
              <label htmlFor="category">Danh mục</label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option value="" disabled>
                  -- Chọn danh mục --
                </option>
                <option value="LAPTOP">Laptop</option>
                <option value="PHONE">Điện thoại</option>
              </select>
            </div>

            {form.category === "LAPTOP" && (
              <div className="form-group">
                <label>Nhà sản xuất</label>
                <select
                  name="factory"
                  value={form.factory}
                  onChange={handleChange}
                >
                  <option value="" disabled>-- Chọn --</option>
                  <option value="DELL">DELL</option>
                  <option value="ACER">ACER</option>
                  <option value="MSI">MSI</option>
                  <option value="LENOVO">LENOVO</option>
                  <option value="HP">HP</option>
                  <option value="ASUS">ASUS</option>
                  <option value="MACBOOK">MACBOOK</option>
                </select>
              </div>
            )}

            {form.category === "PHONE" && (
              <div className="form-group">
                <label>Nhà sản xuất</label>
                <select
                  name="factory"
                  value={form.factory}
                  onChange={handleChange}
                >
                  <option value="" disabled>-- Chọn --</option>
                  <option value="IPHONE">IPHONE</option>
                  <option value="SAMSUNG">SAMSUNG</option>
                  <option value="OPPO">OPPO</option>
                  <option value="VIVO">VIVO</option>
                  <option value="XIAOMI">XIAOMI</option>
                  <option value="REALME">REALME</option>
                  <option value="HONOR">HONOR</option>
                </select>
              </div>
            )}
          </div>

          <div className="features-section">
            <h5>Nhu cầu sử dụng</h5>
            <div className="feature-list">
              {(form.category === "LAPTOP"
                ? FEATURE_NAMES.slice(0, 6)
                : form.category === "PHONE"
                ? FEATURE_NAMES.slice(6)
                : []
              ).map((f) => (
                <div
                  key={f.id}
                  className={`feature-item ${
                    tempFeatures.includes(f.id) ? "selected" : ""
                  }`}
                  onClick={() => toggleFeature(f.id)}
                >
                  {f.name}
                </div>
              ))}
            </div>
          </div>

          <div className="features-section">
            <h5>Thêm ảnh sản phẩm</h5>
            <div className="file-upload-wrapper">
              <input
                type="file"
                id="fileUpload"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                style={{ display: "none" }}
              />
              <label htmlFor="fileUpload" className="custom-upload-btn">
                <RiFolderUploadFill className="upload-icon" />
                {images.length > 0
                  ? `${images.length} file đã chọn`
                  : "Chưa chọn ảnh"}
              </label>
            </div>

            {previewUrls.length > 0 && (
              <div className="image-row">
                {previewUrls.map((url, i) => (
                  <div className="image-item" key={i}>
                    <img src={url} alt={`preview-${i}`} />
                    <button type="button" onClick={() => removePreview(i)}>
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-actions bottom">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleClose()}
            >
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductAdd;
