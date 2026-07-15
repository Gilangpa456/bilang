import './Room.css';

function Room({ number, title, year, image, story, onOpenMemory }) {
  return (
    <section className="room">
      <div className="room-content">
        <span className="room-number">{number}</span>
        <h2 className="room-title">{title}</h2>
        {year && <span className="room-year">{year}</span>}

        <div className="frame">
          <img src={image} alt={title} className="frame-photo" />
          <div className="frame-spotlight"></div>
        </div>

        <p className="room-story">{story}</p>

        <button className="btn-open" onClick={onOpenMemory}>
          Open Memory
        </button>
      </div>
    </section>
  );
}

export default Room;