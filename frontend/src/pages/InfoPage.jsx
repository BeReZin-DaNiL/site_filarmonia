import React from 'react';

const InfoPage = ({ title, content }) => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-primary mb-6">{title}</h1>
        <div className="prose max-w-none text-gray-700">
          {content || (
            <div className="space-y-4">
              <p>
                Раздел "{title}" находится в стадии наполнения. В ближайшее время здесь появится актуальная информация.
              </p>
              <p>
                Следите за обновлениями на нашем сайте и в социальных сетях.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
