import React from 'react';

function Pagination({ currentPage, pageSize, total, onPageChange }) {

  const totalPageNumber = Math.round(total/pageSize + 0.5);

  // Page number
  const pageArray = [];
  for(let i=0; i < totalPageNumber; i++) pageArray.push(i+1);

  // Send change page event
  function onPageChangeClick(event) {
    // Call parent method
    onPageChange(+event.target.getAttribute('data-page'));
  }

  return (
    <div className="pagination">
      <ul className="inline-list list-unstyled">
        {
          pageArray.map(page => (
            <li key={page}>
              <button data-page={page-1} onClick={onPageChangeClick} className={currentPage+1 === page ? 'selected' : '' }>{page}</button>
            </li>
          ))
        }
      </ul>
    </div>
  );
}

export default Pagination;