import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { IoMdCloudUpload, IoMdClose } from "react-icons/io";
import { FaFileExcel, FaTrashAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import './ImportExcel.scss'; 

const ImportExcel = ({ show, setShow, onUpload }
    :{show: boolean, setShow: React.Dispatch<React.SetStateAction<boolean>>, onUpload: (file: File) => void}
) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    
    // Link file mẫu
    const linkExcel = "https://docs.google.com/spreadsheets/d/1Pw8992qWtNr7A3pq_h8ElUcDEZt0hLW4/edit?usp=sharing&ouid=117055227223509551401&rtpof=true&sd=true";

    // Xử lý khi kéo thả file
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            setSelectedFile(acceptedFiles[0]);
        }
    }, []);

    // Cấu hình Dropzone
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false, // Chỉ cho phép 1 file
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        }
    });

    const handleClose = () => {
        setSelectedFile(null);
        setShow(false);
    };

    const handleSubmit = () => {
        if (!selectedFile) {
            toast.error("Vui lòng chọn file Excel!");
            return;
        }
        onUpload(selectedFile); 
        handleClose();
    };

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close-btn" onClick={handleClose}>
                    <IoMdClose />
                </button>
                <div className="modal-header">
                    <h3>Import Sản Phẩm (Excel)</h3>
                </div>
                
                <div className="modal-format">
                    <h4>
                        Tải file Excel mẫu 
                        <a href={linkExcel} target="_blank" rel="noreferrer">
                            tại đây
                        </a>
                    </h4>
                </div>

                <div className="modal-body">
                    {!selectedFile ? (
                        <div 
                            {...getRootProps()} 
                            className={`dropzone-area ${isDragActive ? 'active' : ''}`}
                        >
                            <input {...getInputProps()} />
                            <IoMdCloudUpload className="upload-icon" />
                            {isDragActive ? (
                                <p>Thả file vào đây...</p>
                            ) : (
                                <p>Kéo thả file Excel vào đây <br/> hoặc <span>nhấn để chọn</span></p>
                            )}
                            <small>Chỉ hỗ trợ .xlsx, .xls</small>
                        </div>
                    ) : (
                        <div className="file-preview">
                            <div className="file-info">
                                <FaFileExcel className="excel-icon" />
                                <div>
                                    <span className="file-name">{selectedFile.name}</span>
                                    <span className="file-size">{(selectedFile.size / 1024).toFixed(2)} KB</span>
                                </div>
                            </div>
                            <button className="remove-file-btn" onClick={() => setSelectedFile(null)}>
                                <FaTrashAlt />
                            </button>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-cancel" onClick={handleClose}>Hủy</button>
                    <button 
                        className={`btn-confirm ${!selectedFile ? 'disabled' : ''}`} 
                        onClick={handleSubmit}
                        disabled={!selectedFile}
                    >
                        Upload
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportExcel;