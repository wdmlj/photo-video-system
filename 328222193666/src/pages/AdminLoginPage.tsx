import React, { useState } from 'react';
import { useAuth } from '@/contexts/authContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AdminLoginPage: React.FC = () => {
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 检查是否已登录为管理员
  React.useEffect(() => {
    if (isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [isAdmin, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast('请输入用户名和密码', { type: 'error' });
      return;
    }
    
    setIsLoading(true);
    
    // 模拟登录延迟
    setTimeout(() => {
      const success = login(password, true);
      setIsLoading(false);
      
      if (success && username === 'admin') {
        navigate('/admin/dashboard');
      } else {
        toast('管理员账号或密码错误', { type: 'error' });
      }
    }, 1000);
  };

  const handleBackToUserLogin = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border-t-4 border-primary transform transition-all duration-300 hover:shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
            <i className="fa-solid fa-user-shield text-primary text-2xl"></i>
          </div>
           <h1 className="text-2xl font-bold text-gray-900">管理员登录</h1>
            <p className="text-gray-600 mt-2">请输入管理员账号和密码访问小妹的私密故事管理后台</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              用户名
            </label>
            <div className="relative">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all outline-none"
                placeholder="请输入用户名"
                autoComplete="username"
                disabled={isLoading}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <i className="fa-solid fa-user text-gray-400"></i>
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              密码
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all outline-none"
                placeholder="请输入密码"
                autoComplete="current-password"
                disabled={isLoading}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <i className="fa-solid fa-lock text-gray-400"></i>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            className={`w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white rounded-xl transition-colors font-medium flex items-center justify-center ${
              isLoading ? 'opacity-80 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                登录中...
              </>
            ) : (
              '管理员登录'
            )}
          </button>
        </form>
        
        <div className="mt-6 flex justify-between items-center">
          <button 
            onClick={handleBackToUserLogin}
            className="text-sm text-gray-600 hover:text-primary transition-colors"
          >
            <i className="fa-solid fa-arrow-left mr-1"></i> 返回用户登录
          </button>
          
          <button 
            className="text-sm text-primary hover:text-primary-dark transition-colors"
            onClick={() => toast('请联系超级管理员重置密码', { type: 'info' })}
          >
            忘记密码?
          </button>
        </div>
        
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>默认管理员账户: admin</p>
          <p className="mt-1">默认管理员密码: admin123</p>
           <p className="mt-2">© 2026 小妹的私密故事管理系统</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;