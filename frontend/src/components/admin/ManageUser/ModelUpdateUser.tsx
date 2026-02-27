import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { toast } from "react-toastify";
import { changeRoleUserForAdmin } from '../../../services/apiServices';
import _ from 'lodash';
import './UpdateDelete.scss';
import type { UserPaginate } from '../../../interfaces';
type ModelUpdateUserProps = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  dataUpdate: UserPaginate;
  resetUpdateData: () => void;
  currentPage: number;
  fetchListUsersWithPaginate: (page: number, keyword?: string) => Promise<void> | void;
};

const ModelUpdateUser = (props: ModelUpdateUserProps) => {
const { show, setShow, dataUpdate} = props;
const handleClose = () => {
  setShow(false);
  setRole("USER");
  props.resetUpdateData();
}
const [role, setRole] = useState("USER");

useEffect(() => {
  if(!_.isEmpty(dataUpdate)) {
    setRole(dataUpdate.role);
  }
}, [dataUpdate]);

const handleSubmiUpdateUser = async() => {
  const res = await changeRoleUserForAdmin(dataUpdate.userID,role);
  if(res && res?.data?.success) {
    toast.success("Update user successfully");
    handleClose();
    await props.fetchListUsersWithPaginate(props.currentPage);
  } 
  if(res && !res?.data?.success) {
    toast.error(res?.data?.message || "Update user failed!");
  }
}
  return (
    <>
      <Modal show={show} onHide={handleClose} backdrop="static" className="model-add-user">
        <Modal.Header closeButton>
          <Modal.Title>Update User: {dataUpdate.email}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <form className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Role</label>
                <select className="form-select" value={role} onChange={(event)=>setRole(event.target.value)}>
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={()=>handleSubmiUpdateUser()}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
export default ModelUpdateUser;