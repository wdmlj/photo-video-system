import { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/authContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AdBanner } from '@/components/AdBanner';
import { MediaGridItem } from '@/components/MediaGridItem';
import { CategoryItem } from '@/components/CategoryItem';

// 定义媒体项类型
export interface MediaItem {
  id: string;
  title: string;
  type: 'photo' | 'video';
  url: string;
  thumbnailUrl?: string;
  date: string;
  size: number;
  tags: string[];
  favorite: boolean;
  albumId?: string;
  albumName?: string;
}

// 定义分类类型
export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

// 定义相册类型
export interface Album {
  id: string;
  name: string;
  coverUrl: string;
  count: number;
  date: string;
}

// 生成模拟媒体数据
const generateMockMediaData = (): MediaItem[] => {
  const mediaItems: MediaItem[] = [];
  const albums = [
    { id: 'album1', name: '家庭聚会' },
    { id: 'album2', name: '旅行记录' },
    { id: 'album3', name: '生日派对' },
    { id: 'album4', name: '风景摄影' }
  ];
  
  // 生成16张照片
  for (let i = 1; i <= 16; i++) {
    const album = albums[Math.floor(Math.random() * albums.length)];
    mediaItems.push({
      id: `photo-${i}`,
      title: `照片 ${i}`,
      type: 'photo',
      url: `https://space.coze.cn/api/coze_space/gen_image?image_size=square_hd&prompt=家庭照片%20粉色系%20温馨%20${i}`,
      date: new Date(Date.now() - Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000).toISOString(),
      size: Math.floor(Math.random() * 5000) + 1000, // 1-6 MB
      tags: ['家庭', '回忆', album.name],
      favorite: i % 5 === 0,
      albumId: album.id,
      albumName: album.name
    });
  }
  
  // 生成6个视频
  for (let i = 1; i <= 6; i++) {
    const album = albums[Math.floor(Math.random() * albums.length)];
    mediaItems.push({
      id: `video-${i}`,
      title: `视频 ${i}`,
      type: 'video',
      url: 'https://storage.googleapis.com/web-dev-assets/video-and-source-tags/chrome.mp4', // 示例视频URL
      thumbnailUrl: `https://space.coze.cn/api/coze_space/gen_image?image_size=square_hd&prompt=视频缩略图%20家庭%20温馨%20${i}`,
      date: new Date(Date.now() - Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000).toISOString(),
      size: Math.floor(Math.random() * 50000) + 10000, // 10-60 MB
      tags: ['家庭', '记录', album.name],
      favorite: i % 3 === 0,
      albumId: album.id,
      albumName: album.name
    });
  }
  
  // 按日期排序
  return mediaItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// 生成分类数据
const generateCategories = (mediaItems: MediaItem[]): Category[] => {
  const categories: Category[] = [
    { id: 'all', name: '全部媒体', icon: 'fa-layer-group', count: mediaItems.length },
    { id: 'photos', name: '照片', icon: 'fa-images', count: mediaItems.filter(item => item.type === 'photo').length },
    { id: 'videos', name: '视频', icon: 'fa-video', count: mediaItems.filter(item => item.type === 'video').length },
    { id: 'favorites', name: '收藏', icon: 'fa-heart', count: mediaItems.filter(item => item.favorite).length },
  ];
  
  return categories;
};

// 生成相册数据
const generateAlbums = (mediaItems: MediaItem[]): Album[] => {
  const albumMap = new Map<string, Album>();
  
  mediaItems.forEach(item => {
    if (item.albumId && item.albumName) {
      if (!albumMap.has(item.albumId)) {
        albumMap.set(item.albumId, {
          id: item.albumId,
          name: item.albumName,
          coverUrl: item.type === 'photo' ? item.url : item.thumbnailUrl || '',
          count: 0,
          date: item.date
        });
      }
      const album = albumMap.get(item.albumId)!;
      album.count += 1;
      // 更新为最新的日期
      if (new Date(item.date) > new Date(album.date)) {
        album.date = item.date;
      }
    }
  });
  
  return Array.from(albumMap.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// 主页面组件
export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMedia, setFilteredMedia] = useState<MediaItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeAlbum, setActiveAlbum] = useState<string | null>(null);
  
  // 初始化数据
  useEffect(() => {
    // 检查是否已登录
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    // 从localStorage加载数据，如果没有则生成模拟数据
    const savedMediaItems = localStorage.getItem('mediaItems');
    let data: MediaItem[];
    
    if (savedMediaItems) {
      data = JSON.parse(savedMediaItems);
    } else {
      data = generateMockMediaData();
      localStorage.setItem('mediaItems', JSON.stringify(data));
    }
    
    setMediaItems(data);
    setCategories(generateCategories(data));
    setAlbums(generateAlbums(data));
    setFilteredMedia(data);
    
    // 增加访问量
    const visits = JSON.parse(localStorage.getItem('visits') || '{"today": 0, "total": 0}');
    visits.today += 1;
    visits.total += 1;
    localStorage.setItem('visits', JSON.stringify(visits));
  }, [isAuthenticated, navigate]);
  
  // 过滤媒体项
  useEffect(() => {
    let result = [...mediaItems];
    
    // 按分类过滤
    if (activeCategory === 'photos') {
      result = result.filter(item => item.type === 'photo');
    } else if (activeCategory === 'videos') {
      result = result.filter(item => item.type === 'video');
    } else if (activeCategory === 'favorites') {
      result = result.filter(item => item.favorite);
    }
    
    // 按相册过滤
    if (activeAlbum) {
      result = result.filter(item => item.albumId === activeAlbum);
    }
    
    // 按搜索词过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.tags.some(tag => tag.toLowerCase().includes(query)) ||
        (item.albumName && item.albumName.toLowerCase().includes(query))
      );
    }
    
    setFilteredMedia(result);
  }, [activeCategory, searchQuery, mediaItems, activeAlbum]);
  
  // 切换分类
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setActiveAlbum(null);
    setSearchQuery('');
  };
  
  // 切换相册
  const handleAlbumChange = (albumId: string | null) => {
    setActiveAlbum(albumId);
    setActiveCategory('all');
    setSearchQuery('');
  };
  
  // 切换侧边栏
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  // 处理登出
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  // 查看媒体详情
  const handleViewMedia = (mediaId: string) => {
    navigate(`/view/${mediaId}`);
  };
  
  return (
    <div className="min-h-screen bg-background text-text">
      {/* 顶部滚动广告栏 */}
      <AdBanner />
      
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* 左侧菜单按钮和logo */}
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-gray-600"
              onClick={toggleSidebar}
            >
              <i className="fa-solid fa-bars text-lg"></i>
            </button>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-camera text-primary text-xl"></i>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                小妹的私密故事</h1>
            </div>
          </div>
          
          {/* 中间搜索框 */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="搜索照片和视频..."
                className="w-full py-2 px-4 pr-10 rounded-lg bg-tertiary/50 border-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <i className="fa-solid fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
          
          {/* 右侧操作按钮 */}
          <div className="flex items-center gap-3">
            <button 
              className="p-2 rounded-full hover:bg-tertiary/50"
              onClick={toggleTheme}
              aria-label={`切换到${theme === 'light' ? '深色' : '浅色'}模式`}
            >
              <i className={`fa-solid ${theme === 'light' ? 'fa-moon' : 'fa-sun'} text-lg`}></i>
            </button>
            
            <button 
              className="p-2 rounded-full hover:bg-tertiary/50"
              onClick={handleLogout}
            >
              <i className="fa-solid fa-right-from-bracket text-lg"></i>
            </button>
          </div>
        </div>
        
        {/* 移动端搜索框 */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="搜索照片和视频..."
              className="w-full py-2 px-4 pr-10 rounded-lg bg-tertiary/50 border-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <i className="fa-solid fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        {/* 侧边栏 */}
        <aside className={`${
          isSidebarOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 shrink-0`}>
          <div className="sticky top-24 bg-white rounded-xl shadow-sm p-4">
            <div className="space-y-1">
              {categories.map(category => (
                <CategoryItem 
                  key={category.id}
                  category={category}
                  isActive={activeCategory === category.id && !activeAlbum}
                  onClick={() => handleCategoryChange(category.id)}
                />
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-medium text-gray-500 mb-3 px-4 text-sm uppercase tracking-wider">
                相册
              </h3>
              <div className="space-y-1">
                {albums.map(album => (
                  <button
                    key={album.id}
                    onClick={() => handleAlbumChange(activeAlbum === album.id ? null : album.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-all duration-200 ${
                      activeAlbum === album.id 
                        ? 'bg-primary/10 text-primary' 
                        : 'hover:bg-tertiary/50'
                    }`}
                  >
                    <i className="fa-solid fa-folder text-center"></i>
                    <span className="flex-1 font-medium">{album.name}</span>
                    <span className="bg-tertiary/70 text-gray-600 text-xs px-2 py-1 rounded-full">
                      {album.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-4">
                <h3 className="font-medium mb-2">存储空间使用</h3>
                <div className="w-full bg-tertiary/50 rounded-full h-2 mb-2">
                  <div className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <p className="text-sm text-gray-600">45% 的 100GB 已使用</p>
              </div>
            </div>
          </div>
        </aside>
        
        {/* 主内容区域 */}
        <div className="flex-1">
          {/* 内容标题和过滤器 */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">
                {activeAlbum 
                  ? albums.find(a => a.id === activeAlbum)?.name 
                  : categories.find(c => c.id === activeCategory)?.name || '全部媒体'}
              </h2>
              <p className="text-gray-600 mt-1">{filteredMedia.length} 个项目</p>
            </div>
            
            <div className="flex items-center gap-2 mt-3 md:mt-0">
              <button className="p-2 rounded-lg bg-tertiary/50 hover:bg-tertiary">
                <i className="fa-solid fa-th-large"></i>
              </button>
              <button className="p-2 rounded-lg hover:bg-tertiary/50">
                <i className="fa-solid fa-list"></i>
              </button>
            </div>
          </div>
          
          {/* 媒体网格 */}
          {filteredMedia.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMedia.map(media => (
                <MediaGridItem 
                  key={media.id} 
                  media={media} 
                  onClick={() => handleViewMedia(media.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl p-8 text-center">
              <i className="fa-solid fa-folder-open text-5xl text-gray-300 mb-4"></i>
              <h3 className="text-xl font-medium mb-2">未找到项目</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ? `没有找到与"${searchQuery}"相关的结果` : '此集合为空'}
              </p>
              <button 
                className="py-2 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
                onClick={() => {
                  setActiveCategory('all');
                  setActiveAlbum(null);
                  setSearchQuery('');
                }}
              >
                查看全部媒体
              </button>
            </div>
          )}
        </div>
      </main>
      
      {/* 底部 */}
      <footer className="mt-10 py-6 bg-white shadow-sm">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
           <div className="flex items-center gap-2 mb-4 md:mb-0">
              <i className="fa-solid fa-camera text-primary"></i>
              <span className="font-bold">小妹的私密故事</span>
            </div>
          
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-600 hover:text-primary transition-colors">
              <i className="fa-brands fa-weixin text-xl"></i>
            </a>
            <a href="#" className="text-gray-600 hover:text-primary transition-colors">
              <i className="fa-brands fa-weibo text-xl"></i>
            </a>
            <a href="#" className="text-gray-600 hover:text-primary transition-colors">
              <i className="fa-brands fa-qq text-xl"></i>
            </a>
          </div>
          
           <div className="mt-4 md:mt-0 text-sm text-gray-600">
              © 2026 小妹的私密故事. 保留所有权利.
            </div>
        </div>
      </footer>
    </div>
  );
}