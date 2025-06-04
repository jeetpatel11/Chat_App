import React from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthstore'
import { MessageSquare, Settings, User,LogOut } from 'lucide-react'


function Navbar() {
  const {logout,authUser} = useAuthStore();
  return (
   <>
    <header className='bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg
    bg-base-100/80'>
      <div className='container mx-auto px-4 h-16 '>
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center gap-8">
          <Link to='/' className='flex item-center gap-2.5 hover:opacity-80 transition-all'>
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className='w-5 h-5 text-primary'/>
            </div>
            <h1 className='text-lg font-bold'>Chatty</h1>
          </Link>
        </div>

        <div className='flex items-center gap-2'>
          <Link to={'/setting'} className={'btn btn-sm gap-2 transition-colors'}>
          <Settings className='w-5 h-5'/>
          <span className='hidden sm:inline'>Setting</span>
          </Link>
          

          {authUser &&(
            <>
            <Link to={'/profile'} className={'btn btn-sm gap-2 '}>
              <User className='Size-5'/>
              <span className='hidden sm:inline'>Profile</span>
            </Link>

            <button onClick={logout} className='flex gap-2 item-center'>
              <LogOut className='size-5'/>
              <span className='hidden sm:inline'>Logout</span>
            </button>
            </>
          )}

        </div>
      </div>
      </div>
      
    </header>
   </>
  )
}

export default Navbar
