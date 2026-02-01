import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/authContext';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { MediaItem } from './Home';
import { AdminMediaManager } from '@/components/AdminMediaManager';
import { AdminAdManager } from '@/components/AdminAdManager';
import { AdminUserManager } from '@/components/AdminUserManager';
import { AdminSettings } from '@/components/AdminSettings';

// 定义数据看板类型
interface DashboardStats {
  totalPhotos: number;
  totalVideos: number;
  totalMedia: number;
  todayVisits: number;
  totalVisits: number;
  storageUsed: number;
}

// 定义分类统计类型
interface CategoryStat {
  name: string;
  value: number;
}

// 定义访问趋势类型
interface VisitTrend {
  date: string;
  visits: number;
}

const AdminDashboard: React.FC = () => {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    totalPhotos: 0,
    totalVideos: 0,
    totalMedia: 0,
    todayVisits: 0,
    totalVisits: 0,
    storageUsed: 0
  });
  const [categoryData, setCategoryData] = useState<CategoryStat[]>([]);
  const [visitTrendData, setVisitTrendData] = useState<VisitTrend[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 检查权限
  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    
    // 加载数据
    loadDashboardData();
  }, [isAdmin, navigate]);

  // 加载仪表盘数据
  const loadDashboardData = () => {
    setIsLoading(true);
    
    // 模拟加载延迟
    setTimeout(() => {
      // 获取媒体数据
      const savedMediaItems = localStorage.getItem('mediaItems');
      const items: MediaItem[] = savedMediaItems ? JSON.parse(savedMediaItems) : [];
      setMediaItems(items);
      
      // 计算统计数据
      const totalPhotos = items.filter(item => item.type === 'photo').length;
      const totalVideos = items.filter(item => item.type === 'video').length;
      const totalMedia = items.length;
      
      // 计算存储使用量 (模拟数据)
      const totalSize = items.reduce((sum, item) => sum + item.size, 0);
      const storageUsed = Math.round((totalSize / (1024 * 1024 * 1024 * 100)) * 100); // 100GB总容量
      
      // 获取访问量数据
      const visits = JSON.parse(localStorage.getItem('visits') || '{"today": 0, "total": 0}');
      
      // 计算分类统计
      const categoryMap = new Map<string, number>();
      items.forEach(item => {
        if (item.albumName) {
          categoryMap.set(item.albumName, (categoryMap.get(item.albumName) || 0) + 1);
        }
      });
      
      // 生成模拟访问趋势数据
      const trendData: VisitTrend[] = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {const date = new Date(today);
        date.setDate(date.getDate() - i);
        trendData.push({
          date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
          visits: Math.floor(Math.random() * 50) + 10
        });
      }
      
      // 更新状态
      setStats({
        totalPhotos,
        totalVideos,
        totalMedia,
        todayVisits: visits.today,
        totalVisits: visits.total,
        storageUsed
      });
      
      setCategoryData(Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value })));
      setVisitTrendData(trendData);
      
      setIsLoading(false);
    }, 800);
  };

  // 处理登出
  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // 处理标签切换
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // 颜色配置
  const COLORS = ['#f8a0b7', '#f7c9d9', '#f9e0e6', '#a0c4f8', '#c9d9f7', '#e0e6f9'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-lg font-medium text-gray-700">加载管理数据中...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-user-shield text-primary text-xl"></i>
               <h1 className="text-xl font-bold">小妹的私密故事管理系统</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">管理员</span>
            <button 
              className="p-2 rounded-full hover:bg-gray-100"
              onClick={handleLogout}
              title="退出登录"
            >
              <i className="fa-solid fa-right-from-bracket text-gray-600"></i>
            </button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        {/* 导航标签 */}
        <div className="flex flex-wrap gap-2 mb-6 bg-white p-2 rounded-xl shadow-sm">
          <button 
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-primary text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => handleTabChange('dashboard')}
          >
            <i className="fa-solid fa-dashboard mr-2"></i> 数据看板
          </button>
          <button 
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'media' 
                ? 'bg-primary text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => handleTabChange('media')}
          >
            <i className="fa-solid fa-photo-film mr-2"></i> 媒体管理
          </button>
          <button 
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'ads' 
                ? 'bg-primary text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => handleTabChange('ads')}
          >
            <i className="fa-solid fa-bullhorn mr-2"></i> 广告管理
          </button>
          <button 
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'users' 
                ? 'bg-primary text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => handleTabChange('users')}
          >
            <i className="fa-solid fa-users mr-2"></i> 用户管理
          </button>
          <button 
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'settings' 
                ? 'bg-primary text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => handleTabChange('settings')}
          >
            <i className="fa-solid fa-gear mr-2"></i> 系统设置
          </button>
        </div>
        
        {/* 内容区域 */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-primary">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">总媒体数</p>
                    <h3 className="text-2xl font-bold mt-1">{stats.totalMedia}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <i className="fa-solid fa-photo-film text-primary"></i>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-primary-light">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">照片数</p>
                    <h3 className="text-2xl font-bold mt-1">{stats.totalPhotos}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary-light/10 flex items-center justify-center">
                    <i className="fa-solid fa-images text-primary-light"></i>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-secondary">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">视频数</p>
                    <h3 className="text-2xl font-bold mt-1">{stats.totalVideos}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                    <i className="fa-solid fa-video text-secondary"></i>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">今日访问</p>
                    <h3 className="text-2xl font-bold mt-1">{stats.todayVisits}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <i className="fa-solid fa-eye text-green-500"></i>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">总访问量</p>
                    <h3 className="text-2xl font-bold mt-1">{stats.totalVisits}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <i className="fa-solid fa-users text-blue-500"></i>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 图表区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 访问趋势图 */}
              <div className="bg-white rounded-xl shadow-sm p-4 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4">访问趋势 (最近7天)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={visitTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="visits" fill="#f8a0b7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* 分类分布图 */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="text-lg font-semibold mb-4">媒体分类分布</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend layout="vertical" verticalAlign="middle" align="right" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* 存储使用情况 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <h3 className="text-lg font-semibold">存储空间使用情况</h3>
                <p className="text-sm text-gray-500 mt-1 md:mt-0">{stats.storageUsed}% 的 100GB 已使用</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-primary to-secondary h-4 rounded-full transition-all duration-500" 
                  style={{ width: `${stats.storageUsed}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'media' && (
          <AdminMediaManager 
            mediaItems={mediaItems} 
            onMediaUpdated={loadDashboardData}
          />
        )}
        
        {activeTab === 'ads' && (
          <AdminAdManager />
        )}
        
        {activeTab === 'users' && (
          <AdminUserManager />
        )}
        
        {activeTab === 'settings' && (
          <AdminSettings />
        )}
      </main>
      
      {/* 底部 */}
      <footer className="mt-10 py-6 bg-white shadow-inner">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
           <p>© 2026 小妹的私密故事管理系统 - 管理员后台</p>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;