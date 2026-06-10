import { useState, useMemo } from 'react';
import Head from 'next/head';

const TYPE_TAGS = {
  '组织架构': { color: 'bg-purple-600', label: '组织架构', icon: '🏢' },
  '人才流动': { color: 'bg-amber-500', label: '人才流动', icon: '👤' },
  '融资': { color: 'bg-emerald-500', label: '融资', icon: '💰' },
  '产品': { color: 'bg-blue-500', label: '产品/战略', icon: '🚀' },
  '招聘': { color: 'bg-pink-500', label: '招聘扩招', icon: '📢' },
  '合作': { color: 'bg-slate-500', label: '合作/政策', icon: '🤝' }
};

const IMPACT_LABELS = {
  high: { text: '高影响', color: 'bg-red-600' },
  medium: { text: '中影响', color: 'bg-amber-500' },
  low: { text: '低影响', color: 'bg-slate-500' }
};

const COMPANY_LOGOS = {
  '字节跳动': '🔴',
  '阿里巴巴': '🟠',
  '月之暗面': '🌙',
  'MiniMax': '💎',
  '百度': '🔵',
  '腾讯': '🟢',
  '智谱AI': '🧠'
};

const MOCK_DATA = [
  {
    id: '1',
    company: '字节跳动',
    type: '组织架构',
    title: 'Flow部门负责人更换',
    summary: 'Flow部门技术负责人离职，由智能创作团队负责人接任，内部震荡持续。',
    date: '2026-06-08',
    source: 'https://36kr.com',
    impact: 'high',
    keyPeople: '周靖人',
    notes: '关注团队稳定性，可能有人员流动机会'
  },
  {
    id: '2',
    company: '阿里巴巴',
    type: '人才流动',
    title: '通义前首席科学家加入创业公司',
    summary: '通义千问前核心科学家离职创立新公司，聚焦多模态Agent方向。',
    date: '2026-06-07',
    source: 'https://36kr.com',
    impact: 'high',
    keyPeople: '周畅',
    notes: '此人曾主导Qwen架构，值得跟进其新动向'
  },
  {
    id: '3',
    company: '月之暗面',
    type: '融资',
    title: '完成新一轮战略融资',
    summary: '传闻估值30亿美元，老股东持续加注，资金用于多模态研发。',
    date: '2026-06-05',
    source: 'https://36kr.com',
    impact: 'medium',
    keyPeople: '',
    notes: '待官方确认'
  },
  {
    id: '4',
    company: 'MiniMax',
    type: '产品',
    title: '发布视频生成模型abab-video-1',
    summary: '支持1080P、60秒视频生成，面向创作者开放API。',
    date: '2026-06-06',
    source: 'https://36kr.com',
    impact: 'medium',
    keyPeople: '',
    notes: '与即梦、可灵形成直接竞争'
  },
  {
    id: '5',
    company: '字节跳动',
    type: '招聘',
    title: 'Seed团队大规模扩招',
    summary: '上海、北京两地新增算法工程师岗位超50个，年薪package上调20%。',
    date: '2026-06-04',
    source: 'https://lagou.com',
    impact: 'medium',
    keyPeople: '',
    notes: '关注其薪资水平变化'
  },
  {
    id: '6',
    company: '百度',
    type: '合作',
    title: '与北京市政府签署AI合作协议',
    summary: '将在政务大模型、智能客服等场景落地，首批覆盖10个委办局。',
    date: '2026-06-03',
    source: 'https://baidu.com',
    impact: 'low',
    keyPeople: '',
    notes: 'ToG方向布局加速'
  }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('全部');
  const [selectedCompany, setSelectedCompany] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [impactFilter, setImpactFilter] = useState('全部');
  const [expandedCard, setExpandedCard] = useState(null);

  const tabs = ['全部', '组织架构', '人才流动', '融资', '产品', '招聘', '合作'];
  const companies = ['全部', ...Array.from(new Set(MOCK_DATA.map(d => d.company)))];

  const filteredData = useMemo(() => {
    return MOCK_DATA.filter(item => {
      const tabMatch = activeTab === '全部' || item.type === activeTab;
      const companyMatch = selectedCompany === '全部' || item.company === selectedCompany;
      const impactMatch = impactFilter === '全部' || item.impact === impactFilter;
      const searchMatch = !searchQuery || 
        item.title.includes(searchQuery) || 
        item.summary.includes(searchQuery) || 
        item.company.includes(searchQuery) ||
        (item.keyPeople && item.keyPeople.includes(searchQuery));
      return tabMatch && companyMatch && impactMatch && searchMatch;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [activeTab, selectedCompany, searchQuery, impactFilter]);

  const highImpactItems = useMemo(() => 
    MOCK_DATA.filter(d => d.impact === 'high').sort((a, b) => new Date(b.date) - new Date(a.date)), 
  []);

  const groupedByDate = useMemo(() => {
    const groups = {};
    filteredData.forEach(item => {
      if (!groups[item.date]) groups[item.date] = [];
      groups[item.date].push(item);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredData]);

  const getWeekday = (dateStr) => {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[new Date(dateStr).getDay()];
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Head>
        <title>竞对情报中心 | 月之暗面</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Hero Header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(59,130,246,0.1),_transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 py-8 relative">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg">
                  🎯
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">竞对情报中心</h1>
                  <p className="text-sm text-slate-400">Competitor Intelligence Radar</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-1">实时追踪AI行业核心动态 · 月之暗面HR</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">{new Date().toLocaleDateString('zh-CN')}</div>
              <div className="text-xs text-slate-500 mt-1">{MOCK_DATA.length} 条动态 · 2 条高影响</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* High Impact Banner */}
        {highImpactItems.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <h2 className="text-lg font-semibold text-red-400">本周高影响动态</h2>
              <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">{highImpactItems.length} 条</span>
            </div>
            <div className="grid gap-3">
              {highImpactItems.map(item => (
                <div 
                  key={item.id} 
                  className="group relative bg-gradient-to-r from-slate-800/80 to-slate-800/40 border border-red-500/30 rounded-xl p-5 hover:border-red-500/50 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{COMPANY_LOGOS[item.company] || '🏢'}</span>
                        <div>
                          <span className="font-bold text-white text-lg">{item.company}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-md ${TYPE_TAGS[item.type].color} text-white font-medium`}>
                              {TYPE_TAGS[item.type].icon} {TYPE_TAGS[item.type].label}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-md ${IMPACT_LABELS[item.impact].color} text-white font-medium`}>
                              ⚠️ {IMPACT_LABELS[item.impact].text}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-300">{formatDate(item.date)}</div>
                        <div className="text-xs text-slate-500">{getWeekday(item.date)}</div>
                      </div>
                    </div>
                    <h3 className="font-bold text-white text-lg mb-2">{item.title}</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{item.summary}</p>
                    {item.notes && (
                      <div className="mt-3 flex items-start gap-2 text-xs text-amber-400 bg-amber-500/10 rounded-lg px-3 py-2">
                        <span className="mt-0.5">💡</span>
                        <span className="italic">{item.notes}</span>
                      </div>
                    )}
                    {item.keyPeople && (
                      <div className="mt-2 text-xs text-slate-400">
                        👤 关键人物：<span className="text-slate-300">{item.keyPeople}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Filters & Controls */}
        <section className="mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2 border border-slate-700">
              <span className="text-slate-500 text-sm">🏢</span>
              <select 
                value={selectedCompany} 
                onChange={e => setSelectedCompany(e.target.value)}
                className="bg-transparent text-sm text-white focus:outline-none cursor-pointer"
              >
                {companies.map(c => <option key={c} value={c} className="bg-slate-800">{c}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2 border border-slate-700">
              <span className="text-slate-500 text-sm">⚡</span>
              <select 
                value={impactFilter} 
                onChange={e => setImpactFilter(e.target.value)}
                className="bg-transparent text-sm text-white focus:outline-none cursor-pointer"
              >
                <option value="全部" className="bg-slate-800">全部影响</option>
                <option value="high" className="bg-slate-800">高影响</option>
                <option value="medium" className="bg-slate-800">中影响</option>
                <option value="low" className="bg-slate-800">低影响</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2 border border-slate-700 flex-1 min-w-[200px]">
              <span className="text-slate-500 text-sm">🔍</span>
              <input 
                type="text" 
                placeholder="搜索标题、公司、人名..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm text-white focus:outline-none w-full placeholder-slate-500"
              />
            </div>
          </div>
        </section>

        {/* Category Tabs */}
        <section className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map(tab => {
              const count = tab === '全部' ? MOCK_DATA.length : MOCK_DATA.filter(d => d.type === tab).length;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700'
                  }`}
                >
                  {tab === '全部' ? '📋' : TYPE_TAGS[tab]?.icon || '📌'} {tab}
                  <span className={`ml-1.5 text-xs ${activeTab === tab ? 'text-blue-200' : 'text-slate-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Timeline */}
        <section>
          {groupedByDate.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-3">🔍</div>
              <div className="text-slate-500">没有匹配的动态</div>
              <div className="text-sm text-slate-600 mt-1">试试调整筛选条件</div>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800" />
              
              {groupedByDate.map(([date, items]) => (
                <div key={date} className="mb-10 relative">
                  {/* Date Marker */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600 flex flex-col items-center justify-center shadow-lg">
                      <span className="text-lg font-bold text-white">{new Date(date).getDate()}</span>
                    </div>
                    <div>
                      <div className="font-bold text-white">{formatDate(date)}</div>
                      <div className="text-xs text-slate-500">{getWeekday(date)} · {items.length} 条动态</div>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent" />
                  </div>

                  {/* Cards */}
                  <div className="ml-16 space-y-3">
                    {items.map(item => (
                      <div 
                        key={item.id} 
                        className="group bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-800 hover:border-slate-600 transition-all duration-300 cursor-pointer"
                        onClick={() => setExpandedCard(expandedCard === item.id ? null : item.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{COMPANY_LOGOS[item.company] || '🏢'}</span>
                            <span className="font-bold text-white">{item.company}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-md ${TYPE_TAGS[item.type].color} text-white font-medium`}>
                              {TYPE_TAGS[item.type].label}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-md ${IMPACT_LABELS[item.impact].color} text-white font-medium`}>
                              {IMPACT_LABELS[item.impact].text}
                            </span>
                          </div>
                          {item.source && (
                            <a 
                              href={item.source} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={e => e.stopPropagation()}
                            >
                              来源 ↗
                            </a>
                          )}
                        </div>
                        <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                        <p className="text-sm text-slate-300 leading-relaxed">{item.summary}</p>
                        
                        {expandedCard === item.id && (
                          <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-2">
                            {item.keyPeople && (
                              <div className="text-xs text-slate-400">
                                👤 关键人物：<span className="text-slate-300">{item.keyPeople}</span>
                              </div>
                            )}
                            {item.notes && (
                              <div className="flex items-start gap-2 text-xs text-amber-400 bg-amber-500/10 rounded-lg px-3 py-2">
                                <span className="mt-0.5">💡</span>
                                <span className="italic">{item.notes}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="mt-2 text-xs text-slate-600 group-hover:text-slate-500 transition-colors">
                          点击展开详情
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12 py-6 text-center">
        <p className="text-sm text-slate-500">数据来自飞书多维表格 · 每日自动同步</p>
        <p className="text-xs text-slate-600 mt-1">竞对情报中心 v1.0 · 月之暗面HR</p>
      </footer>
    </div>
  );
}
