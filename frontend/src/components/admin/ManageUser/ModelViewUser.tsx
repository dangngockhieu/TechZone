import { useMemo } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import './CreateView.scss';
import type { UserPaginate } from '../../../interfaces';
type ModelViewUserProps = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  dataUpdate: UserPaginate;
};
const ModelViewUser = (props: ModelViewUserProps) => {
  const { show, setShow, dataUpdate } = props;
  const handleClose = () => {
    setShow(false);
  };

  const { email, name, role } = useMemo(
    () => ({
      email: dataUpdate?.email || "",
      name: dataUpdate?.name || "",
      role: dataUpdate?.role || "USER",
    }),
    [dataUpdate]
  );

  return (
    <Modal show={show} onHide={handleClose}
  backdrop="static" className="model-user">
      <Modal.Header closeButton>
        <Modal.Title>View User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form className="user-form">
  <div className="form-group full">
    <label>Email</label>
    <input type="email" className="form-control" value={email} disabled />
  </div>

  <div className="row-group">
    <div className="form-group">
      <label>Name</label>
      <input type="text" className="form-control" value={name} disabled />
    </div>

    <div className="form-group">
      <label>Role</label>
      <select className="form-select" value={role} disabled>
        <option value="USER">User</option>
        <option value="ADMIN">Admin</option>
      </select>
    </div>
  </div>
</form>

      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModelViewUser;