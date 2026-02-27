import 'bootstrap/dist/css/bootstrap.min.css';
import ReactPaginate from "react-paginate";
import { BsFillPencilFill, BsFillCameraFill, BsArrowRightCircleFill } from "react-icons/bs";

import type { UserPaginate } from '../../../interfaces';

type TableUserPaginateProps = {
  listUsers: UserPaginate[];
  pageCount: number;
  currentPage: number;
  limit: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  fetchListUsersWithPaginate: (page: number, keyword?: string) => Promise<void> | void;
  handleClickBtnView: (user: UserPaginate) => void;
  handleClickBtnUpdate: (user: UserPaginate) => void;
  resetSearchTerm: () => void;
};

const TableUserPaginate = (props: TableUserPaginateProps) => {
  const { listUsers, pageCount} = props;

  const handlePageClick = (event: { selected: number }) => {
    const newPage = +event.selected + 1;
    
    const newSearchTerm = ""; 
    
    props.setCurrentPage(newPage);
    props.fetchListUsersWithPaginate(newPage, newSearchTerm);
    
    props.resetSearchTerm(); 
  };

  return (
    <div className="user-table">
      <table className="table table-hover table-bordered">
        <thead>
          <tr>
            <th scope="col">Id</th>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Role</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {listUsers && listUsers.length > 0 ? (
            listUsers.map((item, index) => (
              <tr key={index}>
                <td>{(props.currentPage - 1) * props.limit + index + 1}</td>
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>{item.role}</td>
                <td>
                  <button
                    className="btn btn-secondary"
                    onClick={() => props.handleClickBtnView(item)}
                  >
                    <BsFillCameraFill style={{ fontSize: '1.1rem' }} />
                  </button>
                  <button
                    className="btn btn-warning mx-3"
                    onClick={() => props.handleClickBtnUpdate(item)}
                  >
                    <BsFillPencilFill style={{ fontSize: '1.1rem' }} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center">Not found</td>
            </tr>
          )}
        </tbody>
      </table>

      <ReactPaginate
        nextLabel={<BsArrowRightCircleFill style={{ fontSize: '1.5rem' }} />}
        previousLabel={<BsArrowRightCircleFill style={{ fontSize: '1.5rem', transform: 'scaleX(-1)' }} />}
        onPageChange={handlePageClick}
        pageRangeDisplayed={3}
        marginPagesDisplayed={2}
        pageCount={pageCount}
        pageClassName="page-item"
        pageLinkClassName="page-link"
        previousClassName="page-item"
        previousLinkClassName="page-link"
        nextClassName="page-item"
        nextLinkClassName="page-link"
        breakClassName="page-item"
        breakLinkClassName="page-link"
        containerClassName="pagination"
        activeClassName="active"
        renderOnZeroPageCount={null}
        forcePage={props.currentPage - 1}
      />
    </div>
  );
};

export default TableUserPaginate;