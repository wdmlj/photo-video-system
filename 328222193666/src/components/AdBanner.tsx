import React, { useState, useEffect, useRef } from 'react';

// 定义广告横幅类型
interface AdBannerItem {
  id: string;
  imageUrl: string;
  text: string;
  link: string;
  order: number;
}

export const AdBanner: React.FC = () => {
  const [adItems, setAdItems] = useState<AdBannerItem[]>([]);
  const [isScrolling, setIsScrolling] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  // 加载广告数据
  useEffect(() => {
    const savedAds = localStorage.getItem('adBanners');
    if (savedAds) {
      const ads: AdBannerItem[] = JSON.parse(savedAds);
      setAdItems(ads.sort((a, b) => a.order - b.order));
    }
  }, []);

  // 自动滚动效果
  useEffect(() => {
    if (adItems.length <= 1) return;
    
    let animationFrameId: number;
    let startTime: number;
    const duration = 30000; // 30秒滚动一轮
    
    const scroll = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / duration;
      
      if (bannerRef.current) {
        const scrollWidth = bannerRef.current.scrollWidth - bannerRef.current.clientWidth;
        bannerRef.current.scrollLeft = scrollWidth * progress;
      }
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(scroll);
      } else {
        startTime = 0;
        animationFrameId = requestAnimationFrame(scroll);
      }
    };
    
    // 开始滚动
    const startScrolling = () => {
      if (!isScrolling) {
        setIsScrolling(true);
        animationFrameId = requestAnimationFrame(scroll);
      }
    };
    
    // 停止滚动
    const stopScrolling = () => {
      setIsScrolling(false);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
    
    // 监听鼠标事件
    const bannerElement = bannerRef.current;
    if (bannerElement) {
      bannerElement.addEventListener('mouseenter', stopScrolling);
      bannerElement.addEventListener('mouseleave', startScrolling);
    }
    
    // 开始自动滚动
    startScrolling();
    
    // 清理函数
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (bannerElement) {
        bannerElement.removeEventListener('mouseenter', stopScrolling);
        bannerElement.removeEventListener('mouseleave', startScrolling);
      }
    };
  }, [adItems.length, isScrolling]);

  if (adItems.length === 0) {
    return null;
  }

  // 如果只有一个广告，不滚动
  const shouldScroll = adItems.length > 1;

  return (
    <div className="w-full overflow-hidden bg-tertiary/30 relative">
      <div 
        ref={bannerRef}
        className={`flex transition-all duration-300 ease-out whitespace-nowrap ${
          shouldScroll && isScrolling ? 'animate-slide' : ''
        }`}
        style={{ 
          // 复制一份内容以实现无限滚动效果
          width: shouldScroll ? `${adItems.length * 2}00%` : '100%'
        }}
      >
        {/* 第一份内容 */}
        {adItems.map((ad) => (
          <div 
            key={`${ad.id}-1`}
            className={`flex-shrink-0 w-full md:w-1/2 lg:w-1/3 p-2`}
          >
            <a 
              href={ad.link} 
              className="block relative overflow-hidden rounded-lg h-16 md:h-20 group"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img 
                src={ad.imageUrl} 
                alt={ad.text}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
                <div className="px-4 text-white">
                  <p className="font-medium">{ad.text}</p>
                  <p className="text-xs opacity-80">点击查看详情</p>
                </div>
              </div>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="fa-solid fa-arrow-right text-white"></i>
              </div>
            </a>
          </div>
        ))}
        
        {/* 第二份内容（用于无限滚动） */}
        {shouldScroll && adItems.map((ad) => (
          <div 
            key={`${ad.id}-2`}
            className={`flex-shrink-0 w-full md:w-1/2 lg:w-1/3 p-2`}
          >
            <a 
              href={ad.link} 
              className="block relative overflow-hidden rounded-lg h-16 md:h-20 group"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img 
                src={ad.imageUrl} 
                alt={ad.text}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
                <div className="px-4 text-white">
                  <p className="font-medium">{ad.text}</p>
                  <p className="text-xs opacity-80">点击查看详情</p>
                </div>
              </div>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="fa-solid fa-arrow-right text-white"></i>
              </div>
            </a>
          </div>
        ))}
      </div>
      
      {/* 滚动指示器 */}
      {shouldScroll && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
          {adItems.map((_, index) => (
            <span 
              key={index} 
              className="w-1.5 h-1.5 rounded-full bg-white/60"
            ></span>
          ))}
        </div>
      )}
    </div>
  );
};