import React from 'react';

const Placeholder = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p>Этот раздел находится в разработке.</p>
    </div>
  );
};

export default Placeholder;
