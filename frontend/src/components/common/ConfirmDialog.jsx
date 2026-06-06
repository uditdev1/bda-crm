import Modal from './Modal';
import { HiExclamation } from 'react-icons/hi';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, type = 'danger' }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="sm">
      <div className="text-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${type === 'danger' ? 'bg-red-100' : 'bg-yellow-100'}`}>
          <HiExclamation className={type === 'danger' ? 'text-red-600' : 'text-yellow-600'} size={24} />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={type === 'danger' ? 'btn-danger' : 'bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium'}
          >
            Confirm
          </button>
        </div>
      </div>
    </Modal>
  );
}
