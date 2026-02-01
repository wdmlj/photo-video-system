import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from 'sonner';
import App from "./App.tsx";
import "./index.css";

// 初始化模拟数据
const initializeMockData = () => {
  // 检查是否已有数据
  if (!localStorage.getItem('mediaItems')) {
    // 初始化访问量数据
    localStorage.setItem('visits', JSON.stringify({
      today: 0,
      total: 0,
      lastVisit: new Date().toISOString()
    }));
    
    // 初始化广告数据
    localStorage.setItem('adBanners', JSON.stringify([
      {
        id: '1',
        imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=%E5%AE%B6%E5%BA%AD%E7%9B%B8%E5%86%8C%E6%B4%BB%E5%8A%A8%20%E7%85%A7%E7%89%87%20%E6%B8%A9%E9%A6%A8%20%E7%B2%89%E8%89%B2%E7%B3%BB&sign=9a31c8ee5012c92051e57074c3adf532',
        text: '家庭照片征集活动开始啦！',
        link: '#',
        order: 1
      },
      {
        id: '2',
        imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=%E5%AE%B6%E5%BA%AD%E6%B4%BB%E5%8A%A8%20%E4%BA%B2%E5%AD%90%20%E7%B2%89%E8%89%B2%20%E6%B8%A9%E9%A6%A8&sign=a6cc85298902f3ed50585e6496f6d045',
        text: '记录美好瞬间，留住家庭回忆',
        link: '#',
        order: 2
      },
      {
        id: '3',
        imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=%E7%85%A7%E7%89%87%E4%B9%A6%20%E5%AE%9A%E5%88%B6%20%E5%AE%B6%E5%BA%AD%E7%9B%B8%E5%86%8C%20%E7%B2%89%E8%89%B2&sign=44ab8e27cb69be5ee39e91d452b25a1e',
               text: '记录美好生活，珍藏珍贵回忆',
                link: '#',
        order: 3
      }
    ]));
    
    // 初始化管理员数据
    localStorage.setItem('admins', JSON.stringify([
      {
        id: '1',
        username: 'admin',
        role: 'superadmin' // superadmin, admin, editor
      }
    ]));
  }
};

// 初始化数据
initializeMockData();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster 
        position="top-center"
        theme="light"
        duration={3000}
        richColors
      />
    </BrowserRouter>
  </StrictMode>
);
