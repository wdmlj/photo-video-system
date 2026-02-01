import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/authContext';
import { MediaItem } from './Home';

const MediaViewer: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [mediaItem, setMediaItem] = useState<MediaItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // 检查是否已登录
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    // 加载媒体数据
    const savedMediaItems = localStorage.getItem('mediaItems');
    if (savedMediaItems) {
      const mediaItems: MediaItem[] = JSON.parse(savedMediaItems);
      setAllMedia(mediaItems);
      
      // 找到当前媒体项
      const item = mediaItems.find(media => media.id === id);
      if (item) {
        setMediaItem(item);
        setCurrentIndex(mediaItems.indexOf(item));
      } else {
        // 如果找不到当前项，返回首页
        navigate('/home');
      }
    }
    
    setIsLoading(false);
  }, [id, isAuthenticated, navigate]);

  // 处理视频播放状态
  const handleVideoPlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // 处理视频进度条
  const handleVideoProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    setVideoProgress(newProgress);
    
    if (videoRef.current) {
      const duration = videoRef.current.duration || 1;
      videoRef.current.currentTime = (newProgress / 100) * duration;
    }
  };

  // 监听视频进度更新
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration || 1;
      const progress = (videoRef.current.currentTime / duration) * 100;
      setVideoProgress(progress);
    }
  };

  // 监听视频结束
  const handleVideoEnded = () => {
    setIsPlaying(false);
    setVideoProgress(0);
  };

  // 下一个媒体
  const handleNext = () => {
    if (currentIndex < allMedia.length - 1) {
      const nextItem = allMedia[currentIndex + 1];
      navigate(`/view/${nextItem.id}`);
    }
  };

  // 上一个媒体
  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevItem = allMedia[currentIndex - 1];
      navigate(`/view/${prevItem.id}`);
    }
  };

  // 处理键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'Escape') {
        navigate('/home');
      } else if (e.key === ' ') {
        if (mediaItem?.type === 'video') {
          handleVideoPlayPause();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, allMedia, navigate, mediaItem]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black/90 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white">加载中...</p>
        </div>
      </div>
    );
  }

  if (!mediaItem) {
    return (
      <div className="min-h-screen bg-black/90 flex items-center justify-center">
        <div className="text-center p-4">
          <i className="fa-solid fa-exclamation-circle text-white text-4xl mb-4"></i>
          <p className="text-white text-lg">未找到媒体文件</p>
          <button 
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            onClick={() => navigate('/home')}
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/90 text-white flex flex-col">
      {/* 返回按钮 */}
      <div className="absolute top-4 left-4 z-10">
        <button 
          className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
          onClick={() => navigate('/home')}
          aria-label="返回"
        >
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
      </div>
      
      {/* 媒体信息 */}
      <div className="absolute top-4 right-4 z-10 bg-black/50 rounded-lg px-3 py-2 text-sm">
        <div className="flex items-center gap-2">
          <span>{currentIndex + 1}</span>
          <span>/</span>
          <span>{allMedia.length}</span>
        </div>
      </div>
      
      {/* 媒体内容 */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {/* 上一个/下一个导航按钮 */}
        {currentIndex > 0 && (
          <button 
            className="absolute left-4 p-3 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
            onClick={handlePrevious}
            aria-label="上一个"
          >
            <i className="fa-solid fa-chevron-left text-2xl"></i>
          </button>
        )}
        
        {mediaItem.type === 'photo' ? (
          <div className="max-w-full max-h-[80vh] flex items-center justify-center">
            <img 
              src={mediaItem.url} 
              alt={mediaItem.title}
              className="max-w-full max-h-[80vh] object-contain"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-full max-w-4xl max-h-[80vh] flex flex-col items-center">
            <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
              <video
                ref={videoRef}
                src={mediaItem.url}
                className="w-full h-full object-contain bg-black"
                poster={mediaItem.thumbnailUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
                onClick={handleVideoPlayPause}
              />
              
              {/* 播放/暂停按钮（悬停时显示） */}
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity"
                onClick={handleVideoPlayPause}
              >
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-2xl`}></i>
                </div>
              </div>
            </div>
            
            {/* 进度条和控制 */}
            <div className="w-full mt-4 px-2">
              <input
                type="range"
                min="0"
                max="100"
                value={videoProgress}
                onChange={handleVideoProgressChange}
                className="w-full accent-white"
              />
              <div className="flex justify-between text-xs mt-1">
                <button 
                  className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10"
                  onClick={handleVideoPlayPause}
                >
                  <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                  {isPlaying ? '暂停' : '播放'}
                </button>
                <span>{formatFileSize(mediaItem.size)}</span>
              </div>
            </div>
          </div>
        )}
        
        {currentIndex < allMedia.length - 1 && (
          <button 
            className="absolute right-4 p-3 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
            onClick={handleNext}
            aria-label="下一个"
          >
            <i className="fa-solid fa-chevron-right text-2xl"></i>
          </button>
        )}
      </div>
      
      {/* 媒体详情 */}
      <div className="bg-white/10 backdrop-blur-md p-4">
        <h2 className="text-xl font-bold">{mediaItem.title}</h2>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
            {mediaItem.type === 'photo' ? '照片' : '视频'}
          </span>
          {mediaItem.albumName && (
            <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
              {mediaItem.albumName}
            </span>
          )}
          <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
            {formatDate(mediaItem.date)}
          </span>
          <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
            {formatFileSize(mediaItem.size)}
          </span>
        </div>
        {mediaItem.tags.length > 0 && (
          <div className="mt-2">
            <div className="text-sm text-gray-300 mb-1">标签:</div>
            <div className="flex flex-wrap gap-1">
              {mediaItem.tags.map((tag, index) => (
                <span key={index} className="text-xs bg-primary/30 px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* 底部提示 */}
      <div className="text-center text-xs text-white/50 py-2">
        提示: 使用键盘左右箭头切换上一个/下一个，空格播放/暂停视频，ESC返回
      </div>
    </div>
  );
};

export default MediaViewer;