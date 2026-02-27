import { useState, useEffect } from 'react';
import { FaPlus, FaSearch } from "react-icons/fa";
import { IoMdClose } from "react-icons/io"; 
import { toast } from 'react-toastify';
import TableUserPaginate from "./TableUserPaginate";
import ModelCreateUser from "./ModelCreateUser";
import ModelUpdateUser from "./ModelUpdateUser";
import ModelViewUser from "./ModelViewUser";
import { getUserWithPaginate } from '../../../services/apiServices';
import './ManageUser.scss';
import type { UserPaginate } from '../../../interfaces';

const ManagerUser = () => {
  const LIMIT = 5;
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [listUsers, setListUsers] = useState<UserPaginate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [search, setSearch] = useState(false);

  const [showModelCreateUser, setShowModelCreateUser] = useState(false);
  const [showModelUpdateUser, setShowModelUpdateUser] = useState(false);
  const [showModelViewUser, setShowModelViewUser] = useState(false);

  const [dataUpdate, setDataUpdate] = useState<UserPaginate>({} as UserPaginate);

  const fetchAndNotify = async (page: number, keyword = "") => {
    try {
      const res = await getUserWithPaginate(page, LIMIT, keyword);
      console.log(res?.data?.data);
      if (res && res?.data?.success) {
        const users = res?.data?.data?.users || [];
        setListUsers(users);
        setPageCount(Math.ceil((res?.data?.data?.total || 0) / LIMIT));
      } else {
        setListUsers([]);
        setPageCount(0);
        if (res && res?.data?.message) toast.error(res?.data?.message);
      }
    } catch {
      setPageCount(0);
      toast.error('Lỗi khi tìm kiếm');
    }
  };

  const fetchListUsersWithPaginate = fetchAndNotify;

  useEffect(() => {
    const loadUsers = async () => {
      await fetchListUsersWithPaginate(currentPage);
    };
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetSearchTerm = () => {
    setSearchTerm("");
  };

  const handleClearSearch = async () => {
    setCurrentPage(1); 
    setSearchTerm("");
    setSearch(false);
    await fetchAndNotify(1, "");
  };

  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = async () => {
  setSearch(true);
  setCurrentPage(1);
  await fetchAndNotify(1, searchTerm);
};

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  const handleClickBtnUpdate = (user: UserPaginate) => {
    setShowModelUpdateUser(true);
    setDataUpdate(user);
  };

  const handleClickBtnView = (user: UserPaginate) => {
    setShowModelViewUser(true);
    setDataUpdate(user);
  };


  const resetUpdateData = () => {
    setDataUpdate({} as UserPaginate);
    setShowModelUpdateUser(false);
  };

  return (
    <div className="manage-user-container">
      <div className="header">
        <div className="title">Quản lý người dùng</div>
        <div className="actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Nhập email để tìm kiếm ..."
              value={searchTerm}
              onChange={handleChangeSearch}
              onKeyDown={onKeyDown}
            />
            {search ? (
              <button className="search-clear-btn" onClick={handleClearSearch} aria-label="clear search">
                <IoMdClose className="clear-icon" style={{color: 'red', fontSize: '1.2rem', fontWeight: "600"}} />
              </button>
            ) : (
              <button className="search-icon-btn" onClick={handleSearchSubmit} aria-label="search">
                <FaSearch className="search-icon" style={{color: '#636262ff'}} />
              </button>
            )}
          </div>
          <button
            className="btn-create"
            onClick={() => setShowModelCreateUser(true)}
            disabled={showModelCreateUser}
          >
            <FaPlus />  Tạo mới User
          </button>
        </div>
      </div>

      <div className="users-content">
        <div className="table-users-container fade-in">
          <TableUserPaginate
            listUsers={listUsers}
            handleClickBtnUpdate={handleClickBtnUpdate}
            handleClickBtnView={handleClickBtnView}
            fetchListUsersWithPaginate={fetchListUsersWithPaginate}
            pageCount={pageCount}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            resetSearchTerm={resetSearchTerm}
            limit={LIMIT}
          />
        </div>

        <ModelCreateUser
          show={showModelCreateUser}
          setShow={setShowModelCreateUser}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          fetchListUsersWithPaginate={fetchListUsersWithPaginate}
        />

        <ModelUpdateUser
          show={showModelUpdateUser}
          setShow={setShowModelUpdateUser}
          dataUpdate={dataUpdate}
          fetchListUsersWithPaginate={fetchListUsersWithPaginate}
          currentPage={currentPage}
          resetUpdateData={resetUpdateData}
        />

        <ModelViewUser
          show={showModelViewUser}
          setShow={setShowModelViewUser}
          dataUpdate={dataUpdate}
        />
      </div>
    </div>
  );
};

export default ManagerUser;