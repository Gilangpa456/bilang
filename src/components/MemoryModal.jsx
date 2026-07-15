import './MemoryModal.css';

function MemoryModal({ room, onClose }) {
  if (!room) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="modal-frame">
          <img src={room.image} alt={room.title} className="modal-photo" />
        </div>

        <div className="modal-info">
          <span className="modal-year">{room.year}</span>
          <h2 className="modal-title">{room.title}</h2>
          <p className="modal-story">{room.story}</p>
        </div>
      </div>
    </div>
  );
}

export default MemoryModal;