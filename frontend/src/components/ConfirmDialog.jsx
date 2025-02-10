import { Modal, Button } from "react-bootstrap";
import PropTypes from "prop-types";

const ConfirmDialog = ({
    show,
    title,
    message,
    onConfirm,
    onCancel,
    isDeleting = false,
}) => {
    return (
        <Modal show={show} onHide={onCancel} centered>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{message}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onCancel} disabled={isDeleting}>
                    No
                </Button>
                <Button variant="danger" onClick={onConfirm} disabled={isDeleting}>
                    {isDeleting ? "Deleting..." : "Yes"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

ConfirmDialog.propTypes = {
    show: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isDeleting: PropTypes.bool,
};

export default ConfirmDialog;
