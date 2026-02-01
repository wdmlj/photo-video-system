import React, { useState } from 'react';
import { useAuth } from '@/contexts/authContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      toast('请输入密码', { type: 'error' });
      return;
    }
    
    setIsLoading(true);
    
    // 模拟登录延迟
    setTimeout(() => {
      const success = login(password, false);
      setIsLoading(false);
      
      if (success) {
        navigate('/home');
      }
    }, 800);
  };

  const handleAdminLoginRedirect = () => {
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-tertiary flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
            <i className="fa-solid fa-camera text-primary text-2xl"></i>
          </div>
           <h1 className="text-2xl font-bold text-gray-900">小妹的私密故事</h1>
            <p className="text-gray-600 mt-2">请输入密码访问照片和视频</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all outline-none bg-gray-50"
                placeholder="请输入访问密码"
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
                验证中...
              </>
            ) : (
              '登录访问'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button 
            onClick={handleAdminLoginRedirect}
            className="text-sm text-primary hover:text-primary-dark transition-colors font-medium"
          >
            管理员登录
          </button>
        </div>
        
        <div className="mt-8 text-center text-xs text-gray-500">
           <p>默认密码: 123456</p>
            <p className="mt-1">© 2026 小妹的私密故事系统</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;