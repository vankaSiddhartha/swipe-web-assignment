import React from 'react'

const Navbar = () => {
  return (
    <div>
      <header className="pb-6 bg-white lg:pb-0">
    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
     
        <nav className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex-shrink-0 ">
                <div className='w-full max-w-4xl mx-auto p-8' >
                  <a href="#" className="flex items-center ">
      <svg className="w-auto h-12 lg:h-16" viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:"#4F46E5"}}/>
            <stop offset="100%" style={{stopColor:"#7C3AED"}}/>
          </linearGradient>
        </defs>
        
        <path d="M40 25C40 33.2843 33.2843 40 25 40C16.7157 40 10 33.2843 10 25C10 16.7157 16.7157 10 25 10C33.2843 10 40 16.7157 40 25Z" 
              fill="url(#gradient1)"/>
        <path d="M35 25C35 30.5228 30.5228 35 25 35C19.4772 35 15 30.5228 15 25C15 19.4772 19.4772 15 25 15C30.5228 15 35 19.4772 35 25Z" 
              fill="white"/>
        <circle cx="25" cy="25" r="7" fill="url(#gradient1)"/>
        
        <text x="55" y="32" 
              fontFamily="Arial, sans-serif" 
              fontSize="24" 
              fontWeight="bold" 
              fill="#1F2937">
          Swipe
        </text>
        <text x="55" y="45" 
              fontFamily="Arial, sans-serif" 
              fontSize="12" 
              fill="#6B7280">
          Invoice Manager
        </text>
      </svg>
    </a>
    </div>
            </div>

            <button type="button" class="inline-flex p-2 text-black transition-all duration-200 rounded-md lg:hidden focus:bg-gray-100 hover:bg-gray-100">
                <svg className="block w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                </svg>

                <svg className="hidden w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <div className="hidden lg:flex lg:items-center lg:ml-auto lg:space-x-10">
                <a href="#" title="" class="text-base font-medium text-black transition-all duration-200 hover:text-blue-600 focus:text-blue-600"> Invoices </a>

                <a href="#" title="" class="text-base font-medium text-black transition-all duration-200 hover:text-blue-600 focus:text-blue-600"> Products </a>

                <a href="#" title="" class="text-base font-medium text-black transition-all duration-200 hover:text-blue-600 focus:text-blue-600"> Customers </a>

            </div>

            <a href="#" title="" class="items-center justify-center hidden px-4 py-3 ml-10 text-base font-semibold text-white transition-all duration-200 bg-blue-600 border border-transparent rounded-md lg:inline-flex hover:bg-blue-700 focus:bg-blue-700" role="button"> Upload Invoice </a>
        </nav>

        <nav className="pt-4 pb-6 bg-white border border-gray-200 rounded-md shadow-md lg:hidden">
            <div className="flow-root">
                <div class="flex flex-col px-6 -my-2 space-y-1">
  
    <a href="#" title="" class="text-base font-medium text-black transition-all duration-200 hover:text-blue-600 focus:text-blue-600"> Invoices </a>

                <a href="#" title="" class="text-base font-medium text-black transition-all duration-200 hover:text-blue-600 focus:text-blue-600"> Products </a>

                <a href="#" title="" class="text-base font-medium text-black transition-all duration-200 hover:text-blue-600 focus:text-blue-600"> Customers </a>
                </div>
            </div>

            <div className="px-6 mt-6">
                <a href="#" title="" class="inline-flex justify-center px-4 py-3 text-base font-semibold text-white transition-all duration-200 bg-blue-600 border border-transparent rounded-md tems-center hover:bg-blue-700 focus:bg-blue-700" role="button"> Upload Invoice </a>
            </div>
        </nav>
    </div>
</header>

    </div>
  )
}

export default Navbar
