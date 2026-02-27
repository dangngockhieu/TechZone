import { useEffect, useState } from "react";
import { RiDeleteBin6Fill } from "react-icons/ri";
import {
  BsFillPencilFill,
  BsFillCameraFill,
  BsArrowRightCircleFill,
} from "react-icons/bs";
import { FaPlus, FaSearch } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import ReactPaginate from "react-paginate";
import { toast } from "react-toastify";

import ProductAdd from "./ProductAdd";
import ProductEdit from "./ProductEdit";
import ProductDetail from "./ProductDetail";
import ProductDelete from "./ProductDelete";
import ImportExcel from "./ImportExcel";

import {
  getProductsWithPaginate,
  deleteProduct,
  uploadExcel,
} from "../../../services/apiServices";

import "./ManageProduct.scss";
import type { ProductPaginate } from "../../../interfaces";

const ManageProduct = () => {
  const LIMIT = 5;

  const [products, setProducts] = useState<ProductPaginate[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [categoryFilter, setCategoryFilter] = useState("LAPTOP");
  const [factoryFilter, setFactoryFilter] = useState("ALL");

  const [loading, setLoading] = useState(false);

  const [showImport, setShowImport] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState<ProductPaginate | null>(null);

  // ================= FETCH =================
  const fetchProducts = async (
    page = 1,
    keyword = "",
    category = "LAPTOP",
    factory = "ALL"
  ) => {
    setLoading(true);
    try {
      const res = await getProductsWithPaginate(
        page,
        LIMIT,
        keyword,
        category,
        factory
      );

      if (res?.data?.success) {
        setProducts(res.data.data.products || []);
        setPageCount(
          Math.ceil((res.data.data.total || 0) / LIMIT)
        );
      } else {
        setProducts([]);
        toast.error(res?.data?.message || "Không tải được dữ liệu");
      }
    } catch {
      toast.error("Lỗi khi tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(
      currentPage,
      searchTerm,
      categoryFilter,
      factoryFilter
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, categoryFilter, factoryFilter]);

  useEffect(() => {
    setFactoryFilter("ALL");
    setCurrentPage(1);
  }, [categoryFilter]);

  // ================= SEARCH =================
  const handleSearchSubmit = async () => {
    setIsSearching(true);
    setCurrentPage(1);
    await fetchProducts(
      1,
      searchTerm,
      categoryFilter,
      factoryFilter
    );
  };

  const handleClearSearch = async () => {
    setSearchTerm("");
    setIsSearching(false);
    setCurrentPage(1);
    await fetchProducts(
      1,
      "",
      categoryFilter,
      factoryFilter
    );
  };

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected + 1);
  };

  // ================= MODAL =================
  const handleOpenModal = (
    type: "add" | "edit" | "detail" | "delete",
    product: ProductPaginate | null = null
  ) => {
    setSelectedProduct(product);
    if (type === "add") setShowAdd(true);
    if (type === "edit") setShowEdit(true);
    if (type === "detail") setShowDetail(true);
    if (type === "delete") setShowDelete(true);
  };

  const handleCloseAll = () => {
    setShowAdd(false);
    setShowEdit(false);
    setShowDetail(false);
    setShowDelete(false);
    setSelectedProduct(null);
  };

  // ================= DELETE =================
  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    try {
      const res = await deleteProduct(selectedProduct.id);
      if (res?.data?.success) {
        toast.success("Đã xóa sản phẩm");
        fetchProducts(
          currentPage,
          searchTerm,
          categoryFilter,
          factoryFilter
        );
      } else {
        toast.error(res?.data?.message || "Xóa thất bại");
      }
    } catch {
      toast.error("Lỗi khi xóa sản phẩm");
    } finally {
      handleCloseAll();
    }
  };

  // ================= IMPORT =================
  const handleUpload = async (file: File) => {
    try {
      const res = await uploadExcel(file);
      if (res?.data?.success) {
        toast.success("Import thành công");
        fetchProducts(
          1,
          "",
          categoryFilter,
          factoryFilter
        );
      } else {
        toast.error("Import thất bại");
      }
    } catch {
      toast.error("Lỗi khi import Excel");
    }
  };

  // ================= UI =================
  return (
    <div className="manage-product-container">
      <div className="manage-header">
        <div className="title">Quản lý sản phẩm</div>

        <div className="manage-actions">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="LAPTOP">Laptop</option>
            <option value="PHONE">Điện thoại</option>
          </select>

          <select
            value={factoryFilter}
            onChange={(e) => setFactoryFilter(e.target.value)}
          >
            <option value="ALL">Tất cả</option>
            {categoryFilter === "LAPTOP" && (
              <>
                <option value="DELL">DELL</option>
                <option value="ACER">ACER</option>
                <option value="MSI">MSI</option>
                <option value="LENOVO">LENOVO</option>
                <option value="HP">HP</option>
                <option value="ASUS">ASUS</option>
                <option value="MACBOOK">MACBOOK</option>
              </>
            )}
            {categoryFilter === "PHONE" && (
              <>
                <option value="IPHONE">IPHONE</option>
                <option value="SAMSUNG">SAMSUNG</option>
                <option value="OPPO">OPPO</option>
                <option value="VIVO">VIVO</option>
                <option value="XIAOMI">XIAOMI</option>
                <option value="REALME">REALME</option>
                <option value="HONOR">HONOR</option>
              </>
            )}
          </select>

          <div className="search-box">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm sản phẩm..."
              onKeyDown={(e) =>
                e.key === "Enter" && handleSearchSubmit()
              }
            />
            {isSearching ? (
              <button className="search-clear-btn" onClick={handleClearSearch}>
                <IoMdClose className="clear-icon" />
              </button>
            ) : (
              <button className="search-icon-btn" onClick={handleSearchSubmit}>
                <FaSearch className="search-icon" />
              </button>
            )}
          </div>

          <button className="btn-upload" onClick={() => setShowImport(true)}>
            Upload Excel
          </button>

          <button className="btn-add" onClick={() => handleOpenModal("add")}>
            <FaPlus /> Thêm
          </button>
        </div>
      </div>

      <div className="product-table">
        {loading ? (
          <div className="no-data">Đang tải...</div>
        ) : products.length === 0 ? (
          <div className="no-data">Không có sản phẩm</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Tên</th>
                <th>Số lượng</th>
                <th>Đã bán</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.id}>
                  <td>{(currentPage - 1) * LIMIT + i + 1}</td>
                  <td>{p.name}</td>
                  <td>{p.quantity}</td>
                  <td>{p.sold}</td>
                  <td className="actions">
                    <button className="btn-view" onClick={() => handleOpenModal("detail", p)}>
                      <BsFillCameraFill />
                    </button>
                    <button className="btn-edit" onClick={() => handleOpenModal("edit", p)}>
                      <BsFillPencilFill />
                    </button>
                    <button className="btn-delete" onClick={() => handleOpenModal("delete", p)}>
                      <RiDeleteBin6Fill />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ReactPaginate
        pageCount={pageCount}
        forcePage={currentPage - 1}
        onPageChange={handlePageClick}
        previousLabel={<BsArrowRightCircleFill style={{ transform: "scaleX(-1)" }} />}
        nextLabel={<BsArrowRightCircleFill />}
        containerClassName="pagination"
        activeClassName="active"
      />

      <ProductAdd
        show={showAdd}
        setShow={setShowAdd}
        onRefresh={() =>
          fetchProducts(
            currentPage,
            searchTerm,
            categoryFilter,
            factoryFilter
          )
        }
      />

      <ImportExcel
        show={showImport}
        setShow={setShowImport}
        onUpload={handleUpload}
      />

      {selectedProduct && (
        <>
          <ProductEdit
            show={showEdit}
            setShow={setShowEdit}
            product={selectedProduct}
            onRefresh={() =>
              fetchProducts(
                currentPage,
                searchTerm,
                categoryFilter,
                factoryFilter
              )
            }
          />
          <ProductDetail
            show={showDetail}
            setShow={setShowDetail}
            product={selectedProduct}
          />
          <ProductDelete
            show={showDelete}
            setShow={setShowDelete}
            product={selectedProduct}
            onConfirm={handleConfirmDelete}
          />
        </>
      )}
    </div>
  );
};

export default ManageProduct;
