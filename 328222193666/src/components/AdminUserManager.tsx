import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

// 定义管理员用户类型
interface AdminUser {
  id: string;
  username: string;
  role: 'superadmin' | 'admin' | 'editor';
}

export const AdminUserManager: React.FC = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState<Partial<AdminUser>>({
    username: '',
    role: 'editor'
  });
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<Partial<AdminUser>>({});

  // 加载管理员数据
  useEffect(() => {
    loadAdminData();
  }, []);

  // 加载管理员数据
  const loadAdminData = () => {
    const savedAdmins = localStorage.getItem('admins');
    if (savedAdmins) {
      const admins: AdminUser[] = JSON.parse(savedAdmins);
      setAdminUsers(admins);
    }
  };

  // 保存管理员数据
  const saveAdminData = (admins: AdminUser[]) => {
    localStorage.setItem('admins', JSON.stringify(admins));
    loadAdminData();
  };

  // 处理添加管理员
  const handleAddUser = () => {
    if (!newUser.username) {
      toast('请输入用户名', { type: 'error' });
      return;
    }

    // 检查用户名是否已存在
    if (adminUsers.some(user => user.username === newUser.username)) {
      toast('用户名已存在', { type: 'error' });
      return;
    }

    const userToAdd: AdminUser = {
      id: `admin-${Date.now()}`,
      username: newUser.username,
      role: (newUser.role as 'superadmin' | 'admin' | 'editor') || 'editor'
    };

    const updatedUsers = [...adminUsers, userToAdd];
    saveAdminData(updatedUsers);
    
    // 重置表单
    setNewUser({ username: '', role: 'editor' });
    setIsAddingUser(false);
    
    toast('管理员添加成功');
  };

  // 处理编辑管理员
  const handleEditUser = () => {
    if (!editUserId || !editUser.username) {
      toast('请填写用户名', { type: 'error' });
      return;
    }

    // 检查用户名是否已存在（排除当前编辑的用户）
    if (adminUsers.some(user => user.username === editUser.username && user.id !== editUserId)) {
      toast('用户名已存在', { type: 'error' });
      return;
    }

    const updatedUsers = adminUsers.map(user => {
      if (user.id === editUserId) {
        // 不能修改超级管理员的角色
        const currentUser = adminUsers.find(u => u.id === editUserId);
        if (currentUser?.role === 'superadmin' && editUser.role !== 'superadmin') {
          toast('超级管理员角色不能更改', { type: 'error' });
          return user;
        }
        
        return {
          ...user,
          username: editUser.username || user.username,
          role: editUser.role as 'superadmin' | 'admin' | 'editor' || user.role
        };
      }
      return user;
    });

    saveAdminData(updatedUsers);
    
    // 重置表单
    setEditUserId(null);
    setEditUser({});
    
    toast('管理员更新成功');
  };

  // 处理删除管理员
  const handleDeleteUser = (userId: string) => {
    // 不能删除超级管理员
    const userToDelete = adminUsers.find(user => user.id === userId);
    if (userToDelete?.role === 'superadmin') {
      toast('超级管理员不能删除', { type: 'error' });
      return;
    }

    // 确保至少保留一个管理员
    if (adminUsers.length <= 1) {
      toast('至少需要保留一个管理员账户', { type: 'error' });
      return;
    }

    if (window.confirm('确定要删除此管理员吗？')) {
      const updatedUsers = adminUsers.filter(user => user.id !== userId);
      saveAdminData(updatedUsers);
      toast('管理员删除成功');
    }
  };

  // 开始编辑管理员
  const startEditUser = (user: AdminUser) => {
    setEditUserId(user.id);
    setEditUser({
      username: user.username,
      role: user.role
    });
    setIsAddingUser(false);
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditUserId(null);
    setEditUser({});
    setIsAddingUser(false);
  };

  // 获取角色显示名称
  const getRoleDisplayName = (role: string): string => {
    switch (role) {
      case 'superadmin':
        return '超级管理员';
      case 'admin':
        return '管理员';
      case 'editor':
        return '编辑';
      default:
        return '普通用户';
    }
  };

  // 获取角色对应的颜色类
  const getRoleColorClass = (role: string): string => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'editor':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* 操作栏 */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">管理员管理</h2>
        <button
          type="button"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          onClick={() => {
            setIsAddingUser(true);
            setEditUserId(null);
          }}
          disabled={isAddingUser || !!editUserId}
        >
          <i className="fa-solid fa-user-plus"></i>
          <span>添加管理员</span>
        </button>
      </div>
      
      {/* 添加/编辑管理员表单 */}
      {(isAddingUser || editUserId) && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editUserId ? '编辑管理员' : '添加新管理员'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                用户名
              </label>
              <input
                type="text"
                id="username"
                value={editUserId ? editUser.username : newUser.username}
                onChange={(e) => editUserId 
                  ? setEditUser(prev => ({ ...prev, username: e.target.value })) 
                  : setNewUser(prev => ({ ...prev, username: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all outline-none"
                placeholder="请输入用户名"
              />
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                角色
              </label>
              <select
                id="role"
                value={editUserId ? editUser.role : newUser.role}
                onChange={(e) => editUserId 
                  ? setEditUser(prev => ({ ...prev, role: e.target.value as 'superadmin' | 'admin' | 'editor' })) 
                  : setNewUser(prev => ({ ...prev, role: e.target.value as 'superadmin' | 'admin' | 'editor' }))
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all outline-none"
                disabled={editUserId && adminUsers.find(u => u.id === editUserId)?.role === 'superadmin'}
              >
                <option value="editor">编辑 (仅上传)</option>
                <option value="admin">管理员 (上传和数据查看)</option>
                <option value="superadmin">超级管理员 (全部权限)</option>
              </select>
              {editUserId && adminUsers.find(u => u.id === editUserId)?.role === 'superadmin' && (
                <p className="text-xs text-gray-500 mt-1">超级管理员角色不能更改</p>
              )}
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={cancelEdit}
              >
                取消
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                onClick={editUserId ? handleEditUser : handleAddUser}
              >
                {editUserId ? '保存修改' : '添加管理员'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 管理员列表 */}
      {adminUsers.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用户名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  角色
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  权限说明
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {adminUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{user.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      getRoleColorClass(user.role)
                    }`}>
                      {getRoleDisplayName(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.role === 'superadmin' && '全部权限：管理媒体、广告、用户和系统设置'}
                    {user.role === 'admin' && '管理媒体、广告和查看数据'}
                    {user.role === 'editor' && '仅上传和管理媒体文件'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className={`text-primary hover:text-primary-dark mr-3 ${
                        user.role === 'superadmin' ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      onClick={() => startEditUser(user)}
                      disabled={isAddingUser || !!editUserId || user.role === 'superadmin'}
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button 
                      className={`text-red-500 hover:text-red-700 ${
                        user.role === 'superadmin' ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={isAddingUser || !!editUserId || user.role === 'superadmin'}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl p-8 text-center">
          <i className="fa-solid fa-users text-5xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-medium mb-2">暂无管理员</h3>
          <p className="text-gray-600 mb-4">点击"添加管理员"按钮创建管理员账户</p>
        </div>
      )}
      
      {/* 权限说明 */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="text-md font-semibold mb-2">权限说明</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>编辑 (Editor):</strong> 只能上传和管理媒体文件，无法访问广告管理、用户管理和系统设置。</p>
          <p><strong>管理员 (Admin):</strong> 可以上传和管理媒体文件，管理广告内容，查看系统数据，但无法管理管理员账户。</p>
          <p><strong>超级管理员 (Superadmin):</strong> 拥有系统的全部权限，包括管理管理员账户和系统设置。</p>
        </div>
      </div>
    </div>
  );
};