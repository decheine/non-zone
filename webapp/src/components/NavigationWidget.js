import React, { useState } from 'react';
import { Interface } from './Interface';
import { svg } from './svg/svg.js';

export const NavigationWidget = ({ autolocate, zoomIn, zoomOut }) => {
  const [showModal, setShowModal] = useState(false);
  const {
    Navigation: { current, create },
  } = svg;
  return (
    <>
      {showModal ? <div></div> : ''}
      <Interface
        leftButton={{
          onClick: zoomIn,
          svg: current,
        }}
        centralButton={{
          onClick: () => setShowModal(true),
          name: 'Create a nonzone',
          svg: create,
        }}
        righButton={{
          onClick: autolocate,
          svg: current,
        }}
      />
    </>
  );
};
