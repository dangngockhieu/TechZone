import { useState, useEffect, useRef, useMemo } from "react";
import {
  addProductFeatures,
  deleteProductFeature,
  updateProduct,
  addProductImages,
  deleteProductImage,
} from "../../../services/apiServices";
import { toast } from "react-toastify";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import "./ProductEdit.scss";
import { RiFolderUploadFill } from "react-icons/ri";
import { IoMdClose } from "react-icons/io";
import type { ProductPaginate } from '../../../interfaces';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Danh sách feature có id + name
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

type ProductEditProps = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  product: ProductPaginate;
  onRefresh: () => void;
};

const ProductEdit = ({ show, setShow, product, onRefresh }: ProductEditProps) => {
  if (!show || !product) return null;
  return (
    <ProductEditContent
      key={product.id}
      setShow={setShow}
      product={product}
      onRefresh={onRefresh}
    />
  );
};

type ProductEditContentProps = Omit<ProductEditProps, "show">;

const ProductEditContent = ({ setShow, product, onRefresh }: ProductEditContentProps) => {
  const initForm = useMemo(() => ({
    name: product?.name || "",
    originalPrice: product?.originalPrice || 0,
    coupon: product?.coupon || 0,
    quantity: product?.quantity || 0,
    infor: product?.infor || "",
    warranty: product?.warranty || "",
    cpu: product?.cpu || "",
    ram: product?.ram || "",
    storage: product?.storage || "",
    screen: product?.screen || "",
    graphicsCard: product?.graphicsCard || "",
    battery: product?.battery || "",
    weight: product?.weight || "",
    releaseYear: product?.releaseYear || "",
    category: product?.category || "",
    factory: product?.factory || "",
  }), [product]);

  const [form, setForm] = useState(() => initForm);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [zoomImg, setZoomImg] = useState<string | null>(null);
  const [imageDelete, setImageDelete] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // === Feature state ===
  const originalFeatures = useMemo(
    () => (Array.isArray(product?.features) ? product.features.map((f) => f.id) : []),
    [product]
  );
  const [tempFeatures, setTempFeatures] = useState<number[]>(() => originalFeatures);

  const existingImages = useMemo(() => {
    const allImages = product?.images?.filter((img) => img) || [];
    return allImages.filter((img) => !imageDelete.includes(img.id));
  }, [product?.images, imageDelete]);

  useEffect(() => {
    return () => previewUrls.forEach((u) => URL.revokeObjectURL(u));
  }, [previewUrls]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const newForm = { ...prev, [name]: value };
      if (name === "category") {
        if(value == product.category){
          newForm.factory = product.factory;
        }
        else{
          newForm.factory = "";
        }
      }
      return newForm;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const allFiles = [...newFiles, ...files];
    setNewFiles(allFiles);
    const urls = allFiles.map((f) => URL.createObjectURL(f));
    previewUrls.forEach((u) => URL.revokeObjectURL(u));
    setPreviewUrls(urls);
    e.target.value = "";
  };

  const removeNewPreview = (idx: number) => {
    const nfiles = [...newFiles];
    const npre = [...previewUrls];
    const removedUrl = npre[idx];
    nfiles.splice(idx, 1);
    npre.splice(idx, 1);
    URL.revokeObjectURL(removedUrl);
    setNewFiles(nfiles);
    setPreviewUrls(npre);
  };

  const handleDeleteExistingImage = (imageId: number) => {
    setImageDelete((prev) => [...prev, imageId]);
  };

  //  Toggle feature theo ID
  const toggleFeature = (id: number) => {
    setTempFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      const resUpdate = await updateProduct(product.id, form);
      if (!(resUpdate && resUpdate.data && resUpdate.data.success)) {
        toast.error(resUpdate?.data?.message || "Cập nhật thất bại");
        return;
      }

      // Xóa ảnh
      for (const imgID of imageDelete) {
        await deleteProductImage(imgID);
      }

      // Thêm ảnh mới
      if (newFiles.length > 0) {
        const fd = new FormData();
        newFiles.forEach((f) => fd.append("images", f));
        await addProductImages(product.id, fd);
      }

      // So sánh feature cũ & mới
      const added = tempFeatures.filter((id) => !originalFeatures.includes(id));
      const removed = originalFeatures.filter(
        (id) => !tempFeatures.includes(id)
      );

      if (added.length > 0) await addProductFeatures(product.id, added);
      for (const id of removed) {
        await deleteProductFeature(product.id, id);
      }

      toast.success("Cập nhật sản phẩm thành công!");
      onRefresh();
      setShow(false);
    } catch{
      toast.error("Lỗi khi cập nhật sản phẩm");
    }
  };

  const handleClose = () => {
    setShow(false);
    setTempFeatures(originalFeatures);
    setNewFiles([]);
    previewUrls.forEach((u) => URL.revokeObjectURL(u));
    setPreviewUrls([]);
    setImageDelete([]);
    setForm(initForm);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <button className="modal-close-btn" onClick={handleClose}>
          <IoMdClose />
        </button>
        <h4>Cập nhật sản phẩm</h4>

        {/* === FORM CHÍNH === */}
        <form className="form-edit-product">
          {[
            { name: "name", label: "Tên sản phẩm" },
            { name: "originalPrice", label: "Giá ban đầu" },
            { name: "coupon", label: "Giảm giá (%)" },
            { name: "quantity", label: "Số lượng" },
            { name: "warranty", label: "Bảo hành" },
            { name: "cpu", label: "CPU" },
            { name: "ram", label: "RAM" },
            { name: "storage", label: "Bộ nhớ" },
            { name: "screen", label: "Màn hình" },
            { name: "graphicsCard", label: "Card đồ họa" },
            { name: "battery", label: "Pin" },
            { name: "weight", label: "Trọng lượng" },
            { name: "releaseYear", label: "Năm phát hành" },
          ].map(({ name, label }) => (
            <div className="form-group" key={name}>
              <label>{label}</label>
              <input
                name={name}
                value={form[name as keyof typeof form]}
                onChange={handleChange}
                placeholder={label}
              />
            </div>
          ))}

          <div className="form-group">
            <label>Thông tin thêm</label>
            <textarea
              name="infor"
              value={form.infor}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Danh mục</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
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
        </form>

        {/* === ẢNH & FEATURE === */}
        <div className="edit-images">
          <h5>Ảnh hiện có</h5>
          <div className="image-row">
            {existingImages.length ? (
              existingImages.map((img, i) => (
                <div key={i} className="image-item">
                  <img
                    src={`${BASE_URL}${img.url}`}
                    alt=""
                    onClick={() => setZoomImg(`${BASE_URL}${img.url}`)}
                  />
                  <button onClick={() => handleDeleteExistingImage(img.id)}>
                    X
                  </button>
                </div>
              ))
            ) : (
              <p>Không có ảnh</p>
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
            <div key={f.id}
              className={`feature-item ${
            tempFeatures.includes(f.id) ? "selected" : "" }`}
            onClick={() => toggleFeature(f.id)}
            >
            {f.name}
        </div>
        ))}
        </div>
          </div>

          <div className="features-section">
            <h5>Thêm ảnh mới</h5>

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
              <RiFolderUploadFill style={{ marginRight: "5px", marginBottom: "2px", fontSize: "30px", color: "#817614ff" }} /> Chọn ảnh ({newFiles.length > 0 ? `${newFiles.length} file đã chọn` : "Chưa chọn ảnh"})
            </label>
            </div>

          {previewUrls.length > 0 && (
              <div className="image-row">
                {previewUrls.map((url, i) => (
                  <div className="image-item" key={i}>
                    <img src={url} alt={`preview-${i}`} />
                    <button type="button" onClick={() => removeNewPreview(i)}>
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
        </div>

        </div>

        {/* === Nút hành động === */}
        <div className="modal-actions bottom">
          <button className="btn btn-secondary" onClick={handleClose}>
            Hủy
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Lưu thay đổi
          </button>
        </div>
      </div>

      {zoomImg && (
        <div className="zoom-overlay" 
          onClick={() => setZoomImg(null)} 
        >
          <div  style={{ width: '100%', height: '100%' }}>
            <TransformWrapper wheel={{ step: 0.2 }} >
              <TransformComponent 
                wrapperStyle={{ width: "100%", height: "100%" }}
                contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <img src={zoomImg} 
                  alt="zoomed" 
                  className="zoomed-img" 
                  style={{ maxHeight: "90vh", maxWidth: "90vw" }} 
                />
              </TransformComponent>
            </TransformWrapper>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductEdit;
