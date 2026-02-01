import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

// 定义广告横幅类型
interface AdBannerItem {
  id: string;
  imageUrl: string;
  text: string;
  link: string;
  order: number;
}

export const AdminAdManager: React.FC = () => {
  const [adItems, setAdItems] = useState<AdBannerItem[]>([]);
  const [isAddingAd, setIsAddingAd] = useState(false);
  const [newAd, setNewAd] = useState<Partial<AdBannerItem>>({
    text: '',
    link: '#',
    order: 0
  });
  const [editAdId, setEditAdId] = useState<string | null>(null);
  const [editAd, setEditAd] = useState<Partial<AdBannerItem>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 加载广告数据
  useEffect(() => {
    loadAdData();
  }, []);

  // 加载广告数据
  const loadAdData = () => {
    const savedAds = localStorage.getItem('adBanners');
    if (savedAds) {
      const ads: AdBannerItem[] = JSON.parse(savedAds);
      setAdItems(ads.sort((a, b) => a.order - b.order));
    }
  };

  // 保存广告数据
  const saveAdData = (ads: AdBannerItem[]) => {
    localStorage.setItem('adBanners', JSON.stringify(ads));
    loadAdData();
  };

  // 处理添加广告
  const handleAddAd = () => {
    if (!newAd.text || !newAd.imageUrl) {
      toast('请填写广告文本和上传图片', { type: 'error' });
      return;
    }

    const order = newAd.order || adItems.length + 1;
    
    const adToAdd: AdBannerItem = {
      id: `ad-${Date.now()}`,
      imageUrl: newAd.imageUrl,
      text: newAd.text,
      link: newAd.link || '#',
      order
    };

    const updatedAds = [...adItems, adToAdd];
    saveAdData(updatedAds);
    
    // 重置表单
    setNewAd({ text: '', link: '#', order: 0 });
    setIsAddingAd(false);
    
    toast('广告添加成功');
  };

  // 处理编辑广告
  const handleEditAd = () => {
    if (!editAdId || !editAd.text) {
      toast('请填写广告文本', { type: 'error' });
      return;
    }

    const updatedAds = adItems.map(ad => {
      if (ad.id === editAdId) {
        return {
          ...ad,
          text: editAd.text || ad.text,
          link: editAd.link || ad.link,
          order: editAd.order !== undefined ? editAd.order : ad.order,
          imageUrl: editAd.imageUrl || ad.imageUrl
        };
      }
      return ad;
    });

    saveAdData(updatedAds);
    
    // 重置表单
    setEditAdId(null);
    setEditAd({});
    
    toast('广告更新成功');
  };

  // 处理删除广告
  const handleDeleteAd = (adId: string) => {
    if (window.confirm('确定要删除此广告吗？')) {
      const updatedAds = adItems.filter(ad => ad.id !== adId);
      saveAdData(updatedAds);
      toast('广告删除成功');
    }
  };

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      toast('请上传图片文件', { type: 'error' });
      return;
    }

    // 检查文件大小（限制5MB）
    if (file.size > 5 * 1024 * 1024) {
      toast('图片大小不能超过5MB', { type: 'error' });
      return;
    }

    // 为图片生成预览URL (在实际应用中，这里应该上传到服务器)
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      if (isEdit) {
        setEditAd(prev => ({ ...prev, imageUrl }));
      } else {
        setNewAd(prev => ({ ...prev, imageUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  // 开始编辑广告
  const startEditAd = (ad: AdBannerItem) => {
    setEditAdId(ad.id);
    setEditAd({
      text: ad.text,
      link: ad.link,
      order: ad.order,
      imageUrl: ad.imageUrl
    });
    setIsAddingAd(false);
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditAdId(null);
    setEditAd({});
    setIsAddingAd(false);
    // 清除文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* 操作栏 */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">广告管理</h2>
        <button
          type="button"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          onClick={() => {
            setIsAddingAd(true);
            setEditAdId(null);
          }}
          disabled={isAddingAd || !!editAdId}
        >
          <i className="fa-solid fa-plus"></i>
          <span>添加广告</span>
        </button>
      </div>
      
      {/* 添加/编辑广告表单 */}
      {(isAddingAd || editAdId) && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editAdId ? '编辑广告' : '添加新广告'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                广告图片
              </label>
              <div className="flex flex-col items-center justify-center w-full">
                <label className="flex flex-col rounded-lg border-2 border-dashed w-full h-48 p-10 group text-center">
                  <div className="h-full w-full text-center flex flex-col items-center justify-center">
                    <div className="flex flex-auto max-h-40 mx-auto -mt-10">
                      {editAdId && editAd.imageUrl ? (
                        <img 
                          src={editAd.imageUrl} 
                          alt="Ad preview" 
                          className="object-contain h-full w-full rounded" 
                        />
                      ) : isAddingAd && newAd.imageUrl ? (
                        <img 
                          src={newAd.imageUrl} 
                          alt="Ad preview" 
                          className="object-contain h-full w-full rounded" 
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <i className="fa-solid fa-cloud-arrow-up text-3xl mb-2"></i>
                          <p className="text-sm">点击或拖拽文件至此处上传</p>
                          <p className="text-xs mt-1">支持 JPG, PNG, GIF (最大 5MB)</p>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, !!editAdId)}
                      className="hidden"
                    />
                    <p className="pointer-events-none text-xs text-gray-500 mt-2">
                      或
                      <span className="text-primary hover:text-primary-dark ml-1">浏览文件</span>
                    </p>
                  </div>
                </label>
              </div>
            </div>
            
            <div>
              <label htmlFor="ad-text" className="block text-sm font-medium text-gray-700 mb-1">
                广告文本
              </label>
              <input
                type="text"
                id="ad-text"
                value={editAdId ? editAd.text : newAd.text}
                onChange={(e) => editAdId 
                  ? setEditAd(prev => ({ ...prev, text: e.target.value })) 
                  : setNewAd(prev => ({ ...prev, text: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all outline-none"
                placeholder="请输入广告文本"
              />
            </div>
            
            <div>
              <label htmlFor="ad-link" className="block text-sm font-medium text-gray-700 mb-1">
                链接地址
              </label>
              <input
                type="text"
                id="ad-link"
                value={editAdId ? editAd.link : newAd.link}
                onChange={(e) => editAdId 
                  ? setEditAd(prev => ({ ...prev, link: e.target.value })) 
                  : setNewAd(prev => ({ ...prev, link: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all outline-none"
                placeholder="请输入链接地址，默认为 #（页面内跳转）"
              />
            </div>
            
            <div>
              <label htmlFor="ad-order" className="block text-sm font-medium text-gray-700 mb-1">
                排序序号
              </label>
              <input
                type="number"
                id="ad-order"
                value={editAdId ? editAd.order : newAd.order}
                onChange={(e) => {
                  const order = parseInt(e.target.value) || 0;
                  editAdId 
                    ? setEditAd(prev => ({ ...prev, order })) 
                    : setNewAd(prev => ({ ...prev, order }))
                }}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all outline-none"
                placeholder="请输入排序序号，数字小的排在前面"
                min="1"
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={cancelEdit}
              >
                取消
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                onClick={editAdId ? handleEditAd : handleAddAd}
              >
                {editAdId ? '保存修改' : '添加广告'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 广告列表 */}
      {adItems.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  预览
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  文本
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  链接
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  排序
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {adItems.map((ad) => (
                <tr key={ad.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-16 h-8 rounded overflow-hidden bg-gray-100">
                      <img 
                        src={ad.imageUrl} 
                        alt={ad.text}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{ad.text}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ad.link}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ad.order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-primary hover:text-primary-dark mr-3"
                      onClick={() => startEditAd(ad)}
                      disabled={isAddingAd || !!editAdId}
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteAd(ad.id)}
                      disabled={isAddingAd || !!editAdId}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl p-8 text-center">
          <i className="fa-solid fa-bullhorn text-5xl text-gray-300 mb-4"></i><h3 className="text-xl font-medium mb-2">暂无广告</h3>
          <p className="text-gray-600 mb-4">点击"添加广告"按钮创建您的第一个广告</p>
        </div>
      )}
    </div>
  );
};