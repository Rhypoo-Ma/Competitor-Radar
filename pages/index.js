import { useState, useEffect } from 'react';

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedImpact, setSelectedImpact] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('all');
  const [expandedCard, setExpandedCard] = useState(null);

  useEffect(() => {
    fetch('/intel.json')
      .then(res => res.json())
      .then(json => {
        const records = json.data || json;
        records.sort((a, b) => new Date(b.date) - new Date(a.date));
        setData(records);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('加载数据失败');
        setLoading(false);
      });
  }, []);

  const isWithinTimeRange = (dateStr, range) => {
    if (range === 'all') return true;
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = (now - date) / (1000 * 60 * 60 * 24);
    switch (range) {
      case '7d': return diffDays <= 7;
      case '30d': return diffDays <= 30;
      case '90d': return diffDays <= 90;
      default: return true;
    }
  };

  const filteredData = data.filter(item => {
    const matchCompany = selectedCompany === 'all' || item.company === selectedCompany;
    const matchType = selectedType === 'all' || item.type === selectedType;
    const matchImpact = selectedImpact === 'all' || item.impact === selectedImpact;
    const matchSearch = !searchQuery || 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.company?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTime = isWithinTimeRange(item.date, timeRange);
    return matchCompany && matchType && matchImpact && matchSearch && matchTime;
  });

  const companies = [...new Set(data.map(d => d.company).filter(Boolean))].sort();
  const types = [...new Set(data.map(d => d.type).filter(Boolean))].sort();
  const impacts = [...new Set(data.map(d => d.impact).filter(Boolean))].sort();

  const getImpactColor = (impact) => {
    const colors = { '高': 'bg-red-500', '中': 'bg-yellow-500', '低': 'bg-green-500' };
    return colors[impact] || 'bg-gray-500';
  };

  const getTypeIcon = (type) => {
    const icons = {
      '组织架构': '🏢', '人才流动': '👥', '融资': '💰', '产品': '🚀', '招聘': '📝', '合作': '🤝'
    };
    return icons[type] || '📋';
  };

  const stats = {
    total: data.length,
    high: data.filter(d => d.impact === '高').length,
    recent7d: data.filter(d => isWithinTimeRange(d.date, '7d')).length,
    companies: companies.length
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white text-xl">加载中...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-red-400 text-xl">{error}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">竞对情报中心</h1>
          <p className="text-gray-400">实时追踪竞品动态</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-gray-400 text-sm">总情报数</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-400">{stats.high}</div>
            <div className="text-gray-400 text-sm">高影响</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">{stats.recent7d}</div>
            <div className="text-gray-400 text-sm">近7天</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">{stats.companies}</div>
            <div className="text-gray-400 text-sm">覆盖公司</div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">公司</label>
              <select value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)}
                className="w-full bg-gray-700 rounded px-3 py-2 text-sm">
                <option value="all">全部</option>
                {companies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">类型</label>
              <select value={selectedType} onChange={e => setSelectedType(e.target.value)}
                className="w-full bg-gray-700 rounded px-3 py-2 text-sm">
                <option value="all">全部</option>
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">影响</label>
              <select value={selectedImpact} onChange={e => setSelectedImpact(e.target.value)}
                className="w-full bg-gray-700 rounded px-3 py-2 text-sm">
                <option value="all">全部</option>
                {impacts.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">时间</label>
              <select value={timeRange} onChange={e => setTimeRange(e.target.value)}
                className="w-full bg-gray-700 rounded px-3 py-2 text-sm">
                <option value="all">全部</option>
                <option value="7d">近7天</option>
                <option value="30d">近30天</option>
                <option value="90d">近90天</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">搜索</label>
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="关键词..." className="w-full bg-gray-700 rounded px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map(item => (
            <div key={item.id}
              className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors cursor-pointer"
              onClick={() => setExpandedCard(expandedCard === item.id ? null : item.id)}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getTypeIcon(item.type)}</span>
                  <span className="font-semibold">{item.company}</span>
                </div>
                <span className={`px-2 py-1 rounded text-xs text-white ${getImpactColor(item.impact)}`}>
                  {item.impact}
                </span>
              </div>
              <h3 className="font-medium mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm mb-2">{item.summary}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{item.date}</span>
                <span className="px-2 py-1 bg-gray-700 rounded">{item.type}</span>
              </div>
              {expandedCard === item.id && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  {item.source && (
                    <a href={item.source} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm hover:underline">
                      查看来源 →
                    </a>
                  )}
                  {item.keyPeople && <p className="text-sm text-gray-400 mt-2">关键人物: {item.keyPeople}</p>}
                  {item.notes && <p className="text-sm text-gray-400 mt-1">备注: {item.notes}</p>}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className="text-center text-gray-500 py-12">没有找到匹配的情报</div>
        )}
      </div>
    </div>
  );
}
