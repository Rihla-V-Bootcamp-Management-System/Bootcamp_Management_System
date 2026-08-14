import React from 'react'
import mockUsers from '../../data/mockUsers'
function Users() {
  return (
    <div>
        <header>
        <div>
            <h2>Admin Panel</h2>
            <p>Welcome, Admin!</p>

        </div>
        <div>
           <input type="text" placeholder="Search admin tools..." />
        </div>
      
    </header>
    <div>
        <div>
            <h2>user Management</h2>
        </div>
        <div>
            <button>Add Account</button>
        </div>
    </div>
    <div>
        <table>
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
            {mockUsers.map((user) => (
                <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.status}</td>
                    <td>
                        <button>Edit</button>
                        <button>Delete</button>
                    </td>
                </tr>
            ))}
        </table>
    </div>
    </div>
  )
}

export default Users
