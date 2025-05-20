import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase.js';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const usersSnap = await getDocs(collection(db, 'users'));
    setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    alert('Add user functionality goes here');
  };

  const handleEditUser = (userId) => {
    const user = users.find(u => u.id === userId);
    setEditUser(user);
    setEditUsername(user.name);
    setEditPassword('');
    setEditModalOpen(true);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    setSaving(true);
    try {
      const userRef = doc(db, 'users', editUser.id);
      const updateData = { name: editUsername };
      if (editPassword) {
        updateData.password = editPassword; // In real apps, hash password server-side
      }
      await updateDoc(userRef, updateData);
      setEditModalOpen(false);
      setEditUser(null);
      setEditUsername('');
      setEditPassword('');
      fetchUsers();
    } catch (err) {
      alert('Failed to update user: ' + err.message);
    }
    setSaving(false);
  };

  const handleDeleteUser = (userId) => {
    setDeleteUserId(userId);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserId) return;
    setSaving(true);
    try {
      await deleteDoc(doc(db, 'users', deleteUserId));
      setDeleteConfirmOpen(false);
      setDeleteUserId(null);
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user: ' + err.message);
    }
    setSaving(false);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditUser(null);
    setEditUsername('');
    setEditPassword('');
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setDeleteUserId(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-8 bg-slate-800/50 backdrop-blur-lg rounded-xl mt-6 shadow-xl border border-white/10">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">User Management</h2>
        <button 
          onClick={handleAddUser}
          className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white py-2 px-4 rounded-lg shadow-lg transform transition-transform hover:scale-105 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add User
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white/5 rounded-xl border border-white/10 shadow-inner">
          <table className="min-w-full divide-y divide-white/10">
            <thead>
              <tr className="bg-white/10">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Username</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((user, index) => (
                <tr key={user.id} className={index % 2 === 0 ? 'bg-white/5' : 'bg-transparent'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="ml-4 text-sm font-medium text-slate-200">{user.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">••••••••</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleEditUser(user.id)}
                      className="text-cyan-400 hover:text-white bg-white/10 hover:bg-cyan-500/20 mr-2 py-1 px-3 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-400 hover:text-white bg-white/10 hover:bg-red-500/20 py-1 px-3 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit User Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-white/10 rounded-xl max-w-md w-full p-6 shadow-2xl transform transition-all animate-fadeIn">
            <h3 className="text-xl font-bold text-white mb-4">Edit User</h3>
            <form onSubmit={handleEditSave}>
              <div className="mb-4">
                <label className="block text-slate-300 text-sm font-medium mb-2">Username</label>
                <input 
                  type="text" 
                  value={editUsername} 
                  onChange={e=>setEditUsername(e.target.value)} 
                  required 
                  className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-6">
                <label className="block text-slate-300 text-sm font-medium mb-2">New Password</label>
                <input 
                  type="password" 
                  value={editPassword} 
                  onChange={e=>setEditPassword(e.target.value)} 
                  placeholder="Leave blank to keep current password" 
                  className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={closeEditModal} 
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white px-4 py-2 rounded-lg shadow transition-colors disabled:opacity-50 flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-b-transparent rounded-full"></div>
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-white/10 rounded-xl max-w-md w-full p-6 shadow-2xl transform transition-all animate-fadeIn">
            <div className="text-red-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">Delete User</h3>
            <p className="text-slate-300 text-center mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={closeDeleteConfirm} 
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteUser} 
                disabled={saving} 
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg shadow transition-colors disabled:opacity-50 flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-b-transparent rounded-full"></div>
                    Deleting...
                  </>
                ) : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 