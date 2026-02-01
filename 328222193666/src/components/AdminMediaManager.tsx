import React, { useState, useRef } from 'react';
import { MediaItem } from '@/pages/Home';
import { toast } from 'sonner';

interface AdminMediaManagerProps {
  mediaItems: MediaItem[];
  onMediaUpdated: () => void;
}

// 定义相册类型
interface Album {
  id: string;
  name: string;
}

export const AdminMediaManager: React.FC<AdminMediaManagerProps> = ({ 
  mediaItems, 
  onMediaUpdated 
}) => {
  const [selectedMediaType, setSelectedMediaType] = useState<'all' | 'photo' | 'video'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState<string>('all');
  const [filteredMedia, setFilteredMedia] = useState<MediaItem[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 初始化数据
  React.useEffect(() => {
    // 提取所有相册
    const albumSet = new Set<string>();
    mediaItems.forEach(item => {
      if (item.albumName) {
        albumSet.add(item.albumName);
      }
    });
    
    const albumList: Album[] = Array.from(albumSet).map(name => ({
      id: `album-${name}`,
      name
    }));
    
    setAlbums(albumList);
    
    // 初始过滤
    filterMediaItems();
  }, [mediaItems, selectedMediaType, searchQuery, selectedAlbum]);

  // 过滤媒体项
  const filterMediaItems = () => {
    let result = [...mediaItems];
    
    // 按类型过滤
    if (selectedMediaType !== 'all') {
      result = result.filter(item => item.type === selectedMediaType);
    }
    
    // 按相册过滤
    if (selectedAlbum !== 'all') {
      result = result.filter(item => item.albumName === selectedAlbum);
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
  };

  // 处理文件上传
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const newMediaItems: MediaItem[] = [];
      const totalFiles = files.length;
      
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const fileType = file.type.startsWith('image/') ? 'photo' : 
                         file.type.startsWith('video/') ? 'video' : 'photo';
        
        // 为文件生成预览URL (在实际应用中，这里应该上传到服务器)
        const previewUrl = URL.createObjectURL(file);
        
        // 创建新的媒体项
        const newItem: MediaItem = {
          id: `${fileType}-${Date.now()}-${i}`,
          title: file.name,
          type: fileType,
          url: previewUrl,
          thumbnailUrl: fileType === 'video' ? 'https://space.coze.cn/api/coze_space/gen_image?image_size=square_hd&prompt=%E8%A7%86%E9%A2%91%E7%BC%A9%E7%95%A5%E5%9B%BE%20%E5%AE%B6%E5%BA%AD%20%E6%B8%A9%E9%A6%A8&sign=2cf63eb47e38dababf8f09882b409f53' : undefined,
          date: new Date().toISOString(),
          size: file.size,
          tags: ['新上传'],
          favorite: false,
          albumId: 'album1',
          albumName: '家庭聚会'
        };
        
        newMediaItems.push(newItem);
        
        // 更新上传进度
        const progress = Math.round(((i + 1) / totalFiles) * 100);
        setUploadProgress(progress);
        
        // 模拟上传延迟
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // 保存到localStorage
      const updatedItems = [...mediaItems, ...newMediaItems];
      localStorage.setItem('mediaItems', JSON.stringify(updatedItems));
      
      // 通知父组件更新
      onMediaUpdated();
      
      toast(`成功上传 ${newMediaItems.length} 个文件`);
    } catch (error) {
      toast('文件上传失败，请重试', { type: 'error' });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // 清除文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 处理删除媒体项
  const handleDeleteMedia = (mediaId: string) => {
    if (window.confirm('确定要删除此媒体项吗？此操作无法撤销。')) {
      const updatedItems = mediaItems.filter(item => item.id !== mediaId);
      localStorage.setItem('mediaItems', JSON.stringify(updatedItems));
      onMediaUpdated();
      toast('媒体项已成功删除');
    }
  };

  // 处理编辑媒体项
  const handleEditMedia = (mediaId: string) => {
    const media = mediaItems.find(item => item.id === mediaId);
    if (media) {
      const newTitle = prompt('请输入新的标题:', media.title);
      if (newTitle !== null && newTitle.trim() !== '') {
        const updatedItems = mediaItems.map(item => 
          item.id === mediaId ? { ...item, title: newTitle.trim() } : item
        );
        localStorage.setItem('mediaItems', JSON.stringify(updatedItems));
        onMediaUpdated();
        toast('媒体项已成功更新');
      }
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // 格式化日期
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* 操作栏 */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <button 
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedMediaType === 'all' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setSelectedMediaType('all')}
          >
            全部
          </button>
          <button 
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedMediaType === 'photo' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setSelectedMediaType('photo')}
          >
            照片
          </button>
          <button 
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedMediaType === 'video' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setSelectedMediaType('video')}
          >
            视频
          </button>
          
          <select
            value={selectedAlbum}
            onChange={(e) => setSelectedAlbum(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">全部相册</option>
            {albums.map(album => (
              <option key={album.id} value={album.name}>
                {album.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="w-full md:w-auto flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*,video/*"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
          <button
            type="button"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <i className="fa-solid fa-upload"></i>
            <span>上传媒体</span>
          </button>
        </div>
      </div>
      
      {/* 搜索栏 */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="搜索媒体文件..."
            className="w-full py-2 px-4 pr-10 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <i className="fa-solid fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>
      
      {/* 上传进度 */}
      {isUploading && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">正在上传...</span>
            <span className="text-sm text-gray-500">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* 媒体列表 */}
      {filteredMedia.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    预览
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    标题
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    类型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    相册
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    大小
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日期
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMedia.map((media) => (
                  <tr key={media.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-12 h-12 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                        {media.type === 'photo' ? (
                          <img 
                            src={media.url} 
                            alt={media.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="relative w-full h-full">
                            <img 
                              src={media.thumbnailUrl} 
                              alt={media.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <i className="fa-solid fa-play text-white text-xs"></i>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{media.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        media.type === 'photo' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {media.type === 'photo' ? '照片' : '视频'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {media.albumName || '未分类'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(media.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(media.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        className="text-primary hover:text-primary-dark mr-3"
                        onClick={() => handleEditMedia(media.id)}
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteMedia(media.id)}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl p-8 text-center">
          <i className="fa-solid fa-folder-open text-5xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-medium mb-2">未找到媒体文件</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? `没有找到与"${searchQuery}"相关的结果` : '当前没有媒体文件'}
          </p>
          <button
            type="button"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            onClick={() => {
              setSelectedMediaType('all');
              setSelectedAlbum('all');
              setSearchQuery('');
            }}
          >
            重置筛选
          </button>
        </div>
      )}
      
      {/* 底部统计 */}
      <div className="bg-white rounded-xl shadow-sm p-4 text-center text-sm text-gray-600">
        共找到 {filteredMedia.length} 个媒体文件
      </div>
    </div>
  );
};