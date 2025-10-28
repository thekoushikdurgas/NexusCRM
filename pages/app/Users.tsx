

import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';


const RoleBadge: React.FC<{ role: User['role'] }> = ({ role }) => {
  const baseClasses = "px-3 py-1 text-xs font-medium rounded-full inline-block";
  const roleClasses = {
    Admin: "bg-red-400/20 text-red-500",
    Manager: "bg-purple-400/20 text-purple-500",
    Member: "bg-blue-400/20 text-blue-500",
  };
  return <span className={`${baseClasses} ${roleClasses[role]}`}>{role}</span>;
};

const Users: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user: currentUser } = useAuth();


    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('name', { ascending: true });
            
            if (error) {
                console.error("Error fetching users:", error.message);
            } else if (data) {
                const formattedUsers: User[] = data.map(u => ({
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    role: u.role || 'Member',
                    avatarUrl: u.avatar_url,
                    isActive: u.is_active,
                    lastLogin: 'N/A' // This info isn't in profiles table, simplifying for now
                }));
                setUsers(formattedUsers);
            }
            setIsLoading(false);
        };

        fetchUsers();
    }, []);

    const handleRoleChange = async (userId: string, newRole: User['role']) => {
        const originalUsers = [...users];
        const updatedUsers = users.map(user => user.id === userId ? { ...user, role: newRole } : user);
        setUsers(updatedUsers);

        const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
        
        if (error) {
            console.error("Error updating role:", error.message);
            setUsers(originalUsers); // Revert on error
            alert("Failed to update user role.");
        }
    };

    const handleStatusToggle = async (userId: string) => {
        const originalUsers = [...users];
        const userToUpdate = users.find(user => user.id === userId);
        if (!userToUpdate) return;
        
        const newStatus = !userToUpdate.isActive;
        const updatedUsers = users.map(user => user.id === userId ? { ...user, isActive: newStatus } : user);
        setUsers(updatedUsers);

        const { error } = await supabase.from('profiles').update({ is_active: newStatus }).eq('id', userId);

        if (error) {
            console.error("Error updating status:", error.message);
            setUsers(originalUsers); // Revert on error
            alert("Failed to update user status.");
        }
    };
    
    const canManage = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';

  return (
    <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md border border-border">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-card-foreground">User Management</h1>
        {canManage && (
            <button className="bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">
            Add User
            </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-secondary">
            <tr>
              <th className="p-4 font-semibold text-muted-foreground">User</th>
              <th className="p-4 font-semibold text-muted-foreground">Role</th>
              <th className="p-4 font-semibold text-muted-foreground hidden md:table-cell">Last Login</th>
              <th className="p-4 font-semibold text-muted-foreground">Status</th>
              <th className="p-4 font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && users.map(user => (
              <tr key={user.id} className="border-b border-border hover:bg-secondary">
                <td className="p-4 flex items-center">
                  <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full mr-4" />
                  <div>
                    <p className="font-semibold text-card-foreground">{user.name}</p>
                    <p className="text-sm text-muted-foreground break-all">{user.email}</p>
                  </div>
                </td>
                <td className="p-4">
                  <RoleBadge role={user.role} />
                </td>
                <td className="p-4 text-card-foreground hidden md:table-cell">{user.lastLogin}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full inline-block ${user.isActive ? 'bg-green-400/20 text-green-500' : 'bg-gray-400/20 text-gray-500'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4">
                  {canManage ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as User['role'])}
                        className="border bg-background border-border rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-auto"
                        >
                        <option>Admin</option>
                        <option>Manager</option>
                        <option>Member</option>
                        </select>
                        <button
                        onClick={() => handleStatusToggle(user.id)}
                        className={`text-sm font-medium ${user.isActive ? 'text-yellow-500' : 'text-green-500'} hover:underline whitespace-nowrap`}
                        >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                    </div>
                  ) : <span className='text-sm text-muted-foreground'>No actions</span> }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       {isLoading && (
        <div className="text-center py-10">
            <p className="text-muted-foreground">Loading users...</p>
        </div>
      )}
      {!isLoading && users.length === 0 && (
        <div className="text-center py-10">
            <p className="text-muted-foreground">No users found.</p>
        </div>
      )}
    </div>
  );
};

export default Users;