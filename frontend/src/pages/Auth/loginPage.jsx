import React from 'react';

const LoginPage = () => {
  return (
    <>
      <div className='flex flex-column h-screen w-screen bg-gray-300 '>
        {/* left side */}
        <div className="w-full md:w-1/2 h-full flex items-center justify-center bg-slate-200">
          <div className="p-8">
            {/* Content for left side */}
          </div>
        </div>

        {/* right side */}
        <div className="hidden md:flex w-1/2 h-full items-center justify-center bg-gray-300">
          <div className="p-8">
            {/* Content for right side */}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;