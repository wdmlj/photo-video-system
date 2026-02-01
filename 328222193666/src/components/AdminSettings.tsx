import React, { useState } from 'react';
import { useAuth } from '@/contexts/authContext';
import { toast } from 'sonner';

export const AdminSettings: React.FC = () => {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 处理修改前端访问密码
  const handleChangeFrontendPassword = () => {
    // 验证表单
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast('请填写所有密码字段', { type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast('新密码和确认密码不一致', { type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      toast('密码长度不能少于6位', { type: 'error' });
      return;
    }

    setIsChangingPassword(true);

    // 模拟异步操作
    setTimeout(() => {
      const success = changePassword(currentPassword, newPassword);
      
      if (success) {
        // 重置表单
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
      
      setIsChangingPassword(false);
    }, 800);
  };

  // 处理修改管理员密码
  const handleChangeAdminPassword = () => {
    // 验证表单
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast('请填写所有密码字段', { type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast('新密码和确认密码不一致', { type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      toast('密码长度不能少于6位', { type: 'error' });
      return;
    }

    // 检查当前密码是否正确
    const storedAdminPassword = localStorage.getItem('adminPassword') || 'admin123';
    if (currentPassword !== storedAdminPassword) {
      toast('当前管理员密码错误', { type: 'error' });
      return;
    }

    setIsChangingPassword(true);

    // 模拟异步操作
    setTimeout(() => {
      localStorage.setItem('adminPassword', newPassword);
      
      // 重置表单
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast('管理员密码修改成功');
      setIsChangingPassword(false);
    }, 800);
  };

  // 处理清除缓存
  const handleClearCache = () => {
    if (window.confirm('确定要清除所有缓存数据吗？此操作将重置所有设置，但不会删除媒体文件。')) {
      // 保留媒体文件和管理员数据
      const mediaItems = localStorage.getItem('mediaItems');
      const admins = localStorage.getItem('admins');
      
      // 清除所有localStorage数据
      localStorage.clear();
      
      // 恢复媒体文件和管理员数据
      if (mediaItems) localStorage.setItem('mediaItems', mediaItems);
      if (admins) localStorage.setItem('admins', admins);
      
      toast('缓存已清除');
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-lg font-semibold">系统设置</h2>
      </div>
      
      {/* 前端访问密码设置 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">前端访问密码设置</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
              当前密码
            </label>
            <input
              type="password"
              id="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all outline-none"
              placeholder="请输入当前密码"
              disabled={isChangingPassword}
            />
          </div>
          
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
              新密码
            </label>
            <input
              type="password"
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all outline-none"
              placeholder="请输入新密码（至少6位）"
              disabled={isChangingPassword}
            />
          </div>
          
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
              确认新密码
            </label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all outline-none"
              placeholder="请再次输入新密码"
              disabled={isChangingPassword}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => {
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }}
              disabled={isChangingPassword}
            >
              重置
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              onClick={handleChangeFrontendPassword}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  处理中...
                </>
              ) : (
                '修改前端访问密码'
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* 管理员密码设置 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">管理员密码设置</h3>
        
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            onClick={handleChangeAdminPassword}
            disabled={isChangingPassword}
          >
            {isChangingPassword ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                处理中...
              </>
            ) : (
              '修改管理员密码'
            )}
          </button>
        </div>
      </div>
      
      {/* 系统维护 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">系统维护</h3>
        
        <div className="space-y-4">
          <button
            type="button"
            className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-lg border border-red-200 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            onClick={handleClearCache}
            disabled={isChangingPassword}
          >
            <i className="fa-solid fa-broom"></i>
            <span>清除系统缓存</span>
          </button>
          
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium mb-2">系统信息</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">系统版本</p>
                <p className="font-medium">v1.0.0</p>
              </div>
              <div>
                <p className="text-gray-500">上次更新</p>
                <p className="font-medium">{new Date().toLocaleDateString('zh-CN')}</p>
              </div>
              <div>
                <p className="text-gray-500">数据存储位置</p>
                <p className="font-medium">浏览器本地存储</p>
              </div>
              <div>
                <p className="text-gray-500">技术栈</p>
                <p className="font-medium">React + TypeScript + Tailwind CSS</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 安全提示 */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            <i className="fa-solid fa-shield-alt text-yellow-500"></i>
          </div>
          <div className="ml-3">
            <h4 className="text-md font-medium text-gray-800">安全提示</h4>
            <div className="mt-2 text-sm text-gray-600 space-y-1">
              <p>• 请定期更改密码以保障系统安全</p>
              <p>• 密码应包含字母、数字和特殊字符，长度不少于6位</p>
              <p>• 请勿与他人共享您的管理员账户信息</p>
              <p>• 清除缓存将重置系统设置，但不会删除您的媒体文件</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};