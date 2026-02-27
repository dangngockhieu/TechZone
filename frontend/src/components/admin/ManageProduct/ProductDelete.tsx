import "./ProductDelete.scss";

const ProductDelete = ({ show, setShow, product, onConfirm }
  :{show: boolean, setShow: React.Dispatch<React.SetStateAction<boolean>>, product: { id: number; name: string }, onConfirm: () => void}
) => {
  if (!show || !product) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box delete">
        <h4>Xóa sản phẩm</h4>
        <p>Bạn có chắc muốn xóa <strong>{product.name}</strong> không?</p>
        <div className="modal-actions">
          <button onClick={() => setShow(false)}>Hủy</button>
          <button onClick={onConfirm} className="btn-danger">
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDelete;
