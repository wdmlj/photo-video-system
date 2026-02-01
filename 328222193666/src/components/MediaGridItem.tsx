import React, { useState } from 'react';
import { MediaItem } from '@/pages/Home';

interface MediaGridItemProps {
  media: MediaItem;
  onClick: () => void;
}

export const MediaGridItem: React.FC<MediaGridItemProps> = ({ media, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // 格式化日期
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <div 
      className="relative rounded-xl overflow-hidden bg-tertiary/50 aspect-square cursor-pointer transition-all duration-300 hover:shadow-lg group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* 骨架屏/加载动画 */}
      <div className="absolute inset-0 bg-tertiary/70 animate-pulse opacity-0 group-hover:opacity-0 transition-opacity">
        <div className="w-full h-full"></div>
      </div>
      
      {/* 媒体内容 */}
      {media.type === 'photo' ? (
        <img 
          src={media.url} 
          alt={media.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full relative">
          <img 
            src={media.thumbnailUrl || `https://space.coze.cn/api/coze_space/gen_image?image_size=square_hd&prompt=%E8%A7%86%E9%A2%91%E7%BC%A9%E7%95%A5%E5%9B%BE%20%E5%AE%B6%E5%BA%AD%20%E6%B8%A9%E9%A6%A8&sign=2cf63eb47e38dababf8f09882b409f53`} 
            alt={media.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <i className="fa-solid fa-play text-white text-2xl"></i>
          </div>
        </div>
      )}
      
      {/* 悬停信息 */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex flex-col justify-end transition-all duration-300 transform ${
        isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}>
        <h3 className="text-white font-medium text-sm truncate">{media.title}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-white/80 text-xs">{formatDate(media.date)}</span>
          <span className="text-white/80 text-xs">{formatFileSize(media.size)}</span>
        </div>
      </div>
      
      {/* 媒体类型标记 */}
      <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white">
        <i className={`fa-solid ${media.type === 'photo' ? 'fa-image' : 'fa-video'} text-xs`}></i>
      </div>
      
      {/* 收藏标记 */}
      {media.favorite && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary/80 backdrop-blur-sm flex items-center justify-center text-white">
          <i className="fa-solid fa-heart text-xs"></i>
        </div>
      )}
    </div>
  );
};