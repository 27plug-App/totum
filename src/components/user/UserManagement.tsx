import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Shield,
  UserPlus,
  Mail,
  Key
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useConfirmation } from '../../hooks/useConfirmation';
import LoadingSpinner from '../LoadingSpinner';
import EmptyState from '../EmptyState';
import { object, z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { MainHelper } from '../../lib/helpers/main-helper';
import Parse from 'parse/dist/parse.min.js';
import { User } from '../../models/user';
import { UserController } from '../../controllers/user-controller';
import { ParseCloudCode } from '../../lib/helpers/parse-cloud-code';

const userSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  username: z.string().min(1, 'Username is required'),
  role: z.string(),
  status: z.enum([User.activeStatus, User.inactiveStatus]),
  password:z.string().min(1,{ message:"Password is required" })
  // permissions: z.array(z.string())
});

type NewUser = z.infer<typeof userSchema>;

async function fetchUsers(objectId:string) {
  const result = await ParseCloudCode.getManagementUsers(objectId);

  if(result){
    const resultFormated = JSON.parse(result);
    return resultFormated.data;
  } else {
    return [];
  }
}

async function usersCount(objectId:string){
  const result = await ParseCloudCode.getManagementUsersCount(objectId);

  if(result){
    const resultFormated = JSON.parse(result);
    return resultFormated.count;
  } else {
    return [];
  }
}

function UserManagement() {
  const { success: showSuccess, error: showError } = useToast();
  const { loading, user } = useAuth();
  const { confirm } = useConfirmation();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showNewUser, setShowNewUser] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<NewUser | null>(null);

  const [users, setUsers] = useState<[]>([]);
  const [count, setCount] = useState<number>(0);

  const [newUser, setNewUser] = useState<Omit<NewUser, 'id'>>({
    email: '',
    first_name: '',
    last_name: '',
    username:'',
    role: '',
    status: User.activeStatus,
    password:'',
  });

  useEffect(() => {
    const fetchData = async () => {
      const user = await UserController.getCurrentUserData();

      setUsers(await fetchUsers(user.id ?? ""));
      setCount( await usersCount(user.id ?? ""));
    };

    fetchData();
  }, []);

  const resetNewUser = () => {
    setNewUser({
      email: '',
      first_name: '',
      last_name: '',
      username: '',
      role: '',
      status: User.activeStatus,
      password: '',
    });
  };

  const handleCreateUser = async () => {
    try {
      userSchema.parse(newUser);
      
      const result = await ParseCloudCode.signupUser(newUser);

      const resultFormated = JSON.parse(result);
      if(resultFormated.success){
        setShowNewUser(false);
        resetNewUser();
        showSuccess('User created successfully');

        resetList();
      } else {
        showError('Something when wrong, try again later');
      }

    } catch (error) {
      const errors = JSON.parse(error.message);
      let messages: Array<string> = [];

      errors.forEach(element => {
        messages.push(element.message);
      });;
      
      showError(messages[0]);
    }
  };

  const handleUpdateUser = async (user: NewUser) => {
    try {
      const validatedData = userSchema.parse(user);

      const query = new Parse.Query('_User');
      const userObj = await query.get(user.email);
      
      Object.entries(validatedData).forEach(([key, value]) => {
        userObj.set(key, value);
      });
      
      await userObj.save();

      // if (error) throw error;

      //mutate(prev => 
      //  prev?.map(u => u.id === user.id ? { ...u, ...validatedData } : u) ?? []
      //);
      setEditingUser(null);
      showSuccess('User updated successfully');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to update user');
    }
  };

  const handleSearch = async () => {
    try{

      const result = await ParseCloudCode.searchUers( user?.id,searchTerm );

    if(result){
      const resultFormated = JSON.parse(result);
      setUsers(resultFormated.data);
    } else {
      return [];
    }

    } catch(error){
      console.log("Error found:"+error);
    }
  }

  const resetList = async () => {
    try{
      const user = await UserController.getCurrentUserData();

      setUsers(await fetchUsers(user.id ?? ""));
      setCount( await usersCount(user.id ?? ""));

    } catch(error){
      console.log("Error found:"+error);
    }
  }

  /*const handleDeactivateUser = async (user: User) => {
    confirm({
      title: 'Deactivate User',
      message: `Are you sure you want to deactivate ${user.first_name} ${user.last_name}?`,
      confirmText: 'Deactivate',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/users/${user.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'inactive' }),
          });

          if (!response.ok) {
            throw new Error('Failed to deactivate user');
          }

          if (error) throw error;

          mutate(prev => prev?.filter(u => u.id !== user.id) ?? []);
          showSuccess('User deactivated successfully');
        } catch (error) {
          showError('Failed to deactivate user');
        }
      }
    });
  };

  const handleResetPassword = async (email: string) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send password reset email');
      }
      if (error) throw error;
      showSuccess('Password reset email sent successfully');
    } catch (error) {
      showError('Failed to send password reset email');
    }
  };*/

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  /*if (error) {
    return (
      <EmptyState
        title="Error loading users"
        message="Failed to load users. Please try again."
        icon={<Users className="w-12 h-12 text-red-500" />}
        action={
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        }
      />
    );
  }*/

  const filteredUsers = users?.filter(user => {
    if(roleFilter == 'all'){
      return user.role != roleFilter
    } else {
      return user.role == roleFilter
    }
  }) ?? [];

  return (
    <div className="p-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage user accounts</p>
          </div>
          <button
            onClick={() => setShowNewUser(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>
      </header>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value.trim();

                  if(!value){
                    resetList();
                  }

                  setSearchTerm(e.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              {
                MainHelper.getAllUserRoles().map((role) => (
                  <option value={role.value}>{role.label}</option>
                ))
              }
            </select>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <EmptyState
            title="No users found"
            message={searchTerm ? "No users match your search" : "Start by adding a new user"}
            icon={<Users className="w-12 h-12 text-gray-400" />}
            action={
              <button
                onClick={() => setShowNewUser(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add User
              </button>
            }
          />
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredUsers.map(user => (
              <div key={user.objectId} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-md">
                        {user.firstName[0]}{user.lastName[0]}
                      </span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {user.email}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === User.adminRole || user.role === User.superAdminRole 
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === User.managerRole || user.role === User.employeeRole 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {MainHelper.getUserRole(user.role).charAt(0).toUpperCase() + MainHelper.getUserRole(user.role).slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleResetPassword(user.email)}
                      className="p-2 text-gray-400 hover:text-blue-600"
                      title="Reset Password"
                    >
                      <Key className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setEditingUser(user)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeactivateUser(user)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Form Modal */}
      {(showNewUser || editingUser) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-6">
              {editingUser ? 'Edit User' : 'New User'}
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={editingUser?.first_name ?? newUser.first_name}
                    onChange={e => {
                      if (editingUser) {
                        setEditingUser({ ...editingUser, first_name: e.target.value });
                      } else {
                        setNewUser({ ...newUser, first_name: e.target.value });
                      }
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={editingUser?.last_name ?? newUser.last_name}
                    onChange={e => {
                      if (editingUser) {
                        setEditingUser({ ...editingUser, last_name: e.target.value });
                      } else {
                        setNewUser({ ...newUser, last_name: e.target.value });
                      }
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={editingUser?.email ?? newUser.email}
                  onChange={e => {
                    if (editingUser) {
                      setEditingUser({ ...editingUser, email: e.target.value });
                    } else {
                      setNewUser({ ...newUser, email: e.target.value });
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={editingUser?.username?? newUser.username}
                  onChange={e => {
                    if (editingUser) {
                      setEditingUser({ ...editingUser, username: e.target.value });
                    } else {
                      setNewUser({ ...newUser, username: e.target.value });
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={editingUser?.password ?? newUser.password}
                  onChange={e => {
                    if (editingUser) {
                      setEditingUser({ ...editingUser, password: e.target.value });
                    } else {
                      setNewUser({ ...newUser, password: e.target.value });
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  onChange={e => {
                    if(editingUser) {
                      setEditingUser({...editingUser, role: e.target.value});
                    } else {
                      setNewUser({...newUser, role: e.target.value});
                    }
                  }}
                  >
                  {
                    MainHelper.getManagementUsersRoles().map((role) => (
                      <option value={role.value}>{role.label}</option>
                    ))
                  }
                </select>
              </div>

              {/*<div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="space-y-2">
                  {[
                    'manage_users',
                    'manage_billing',
                    'manage_clinical',
                    'manage_settings',
                    'view_analytics',
                    'manage_authorizations'
                  ].map(permission => (
                    <label key={permission} className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        checked={(editingUser?.permissions ?? newUser.permissions).includes(permission)}
                        onChange={e => {
                          const permissions = e.target.checked
                            ? [...(editingUser?.permissions ?? newUser.permissions), permission]
                            : (editingUser?.permissions ?? newUser.permissions).filter(p => p !== permission);
                          
                          if (editingUser) {
                            setEditingUser({ ...editingUser, permissions });
                          } else {
                            setNewUser({ ...newUser, permissions });
                          }
                        }}
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {permission.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div> */}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowNewUser(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={editingUser ? () => handleUpdateUser(editingUser) : handleCreateUser}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
