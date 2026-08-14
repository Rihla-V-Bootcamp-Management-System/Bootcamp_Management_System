import React from 'react'

function AdminHeader() {
  return (
    <header>
        <div>
            <h2>Admin Panel</h2>
            <p>Welcome, Admin!</p>

        </div>
        <div>
           <input type="text" placeholder="Search admin tools..." />
        </div>
      
    </header>
  )
}

export default AdminHeader
