import React, { useState } from 'react';

function CollapseAlert({ label, text }) {
  const [open, isOpen] = useState(false);

  function openMenu(e) {
    e.preventDefault();
    isOpen(!open);
  }

  return (
    <div className="alert info collapse-alert">
      <button className="btn reset" aria-expanded={open ? 'true' : 'false'} onClick={openMenu}>{label}</button>
      { open ? <div>{text}</div> : null }
    </div>
  );
}

export default CollapseAlert;