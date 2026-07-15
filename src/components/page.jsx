import React from 'react';
import './Page.css';

const Page = React.forwardRef((props, ref) => {
  return (
    <div className="page" ref={ref}>
      <div className="page-frame">
        <img src={props.image} alt="memory" className="page-photo" />
      </div>
    </div>
  );
});

export default Page;