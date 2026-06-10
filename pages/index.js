import { useState, useMemo } from 'react';
import Head from 'next/head';

const TYPE_TAGS = {
  '组织架构': { color: 'bg-purple-600', label: '组织架构' },
  '人才流动': { color: 'bg-amber-500', label: '人才流动' },
  '融资': { color: 'bg-emerald-500', label: '融资' },
  '产品': { color: 'bg-blue-500', label: '产品/战略' },
  '招聘': { color: 'bg-pink-500', label: '招聘扩招' },
  '合作': { color: 'bg-slate-500', label: '合作/政策' }
};

const IMPACT_LABELS = {
  high: { text: '高', color: 'bg-red-600' },
  medium: { text: '中', color: 'bg-amber-500' },
  low: { text: '低', color: 'bg-slate-500' }
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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Head>
        <title>竞对情报中心 | 月之暗面</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">竞对情报中心</h1>
              <p className="text-sm text-slate-400 mt-1">实时追踪AI行业核心动态 · 月之暗面HR</p>
            </div>
            <div className="text-right text-sm text-slate-400">
              <div>{new Date().toLocaleDateString('zh-CN')} 更新</div>
              <div className="text-xs mt-1">共 {MOCK_DATA.length} 条动态</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Executive Summary - Boss View */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            本周高影响动态（{highImpactItems.length}条）
          </h2>
          <div className="grid gap-3">
            {highImpactItems.map(item => (
              <div key={item.id} className="intel-card bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-white">{item.company}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${TYPE_TAGS[item.type].color} text-white`}>
                        {TYPE_TAGS[item.type].label}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${IMPACT_LABELS[item.impact].color} text-white`}>
                        {IMPACT_LABELS[item.impact].text}影响
                      </span>
                    </div>
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <p className="text-sm text-slate-300 mt-1">{item.summary}</p>
                    {item.notes && (
                      <p className="text-xs text-slate-400 mt-2 italic">💡 {item.notes}</p>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap ml-4">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Filters */}
        <section className="mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Company Filter */}
            <select 
              value={selectedCompany} 
              onChange={e => setSelectedCompany(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {companies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Impact Filter */}
            <select 
              value={impactFilter} 
              onChange={e => setImpactFilter(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="全部">全部影响</option>
              <option value="high">高影响</option>
              <option value="medium">中影响</option>
              <option value="low">低影响</option>
            </select>

            {/* Search */}
            <input 
              type="text" 
              placeholder="搜索标题、公司、人名..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white flex-1 min-w-[200px] focus:outline-none focus:border-blue-500"
            />
          </div>
        </section>

        {/* Tab Navigation */}
        <section className="mb-6">
          <div className="flex gap-1 overflow-x-auto pb-2">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tab}
                {tab !== '全部' && (
                  <span className="ml-1.5 text-xs opacity-70">
                    {MOCK_DATA.filter(d => d.type === tab).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section>
          {groupedByDate.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              没有匹配的动态
            </div>
          ) : (
            <div className="relative">
              {groupedByDate.map(([date, items]) => (
                <div key={date} className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold">
                      {new Date(date).getDate()}
                    </div>
                    <div>
                      <div className="font-medium">{date}</div>
                      <div className="text-xs text-slate-400">
                        {new Date(date).toLocaleDateString('zh-CN', { weekday: 'long' })}
                      </div>
                    </div>
                    <div className="flex-1 h-px bg-slate-700"></div>
                    <span className="text-xs text-slate-500">{items.length} 条</span>
                  </div>

                  <div className="grid gap-3 ml-12">
                    {items.map(item => (
                      <div key={item.id} className="intel-card bg-slate-800 border border-slate-700 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{item.company}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${TYPE_TAGS[item.type].color} text-white`}>
                              {TYPE_TAGS[item.type].label}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${IMPACT_LABELS[item.impact].color} text-white`}>
                              {IMPACT_LABELS[item.impact].text}
                            </span>
                          </div>
                          {item.source && (
                            <a 
                              href={item.source} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300"
                            >
                              来源 ↗
                            </a>
                          )}
                        </div>
                        <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                        <p className="text-sm text-slate-300">{item.summary}</p>
                        {item.keyPeople && (
                          <p className="text-xs text-slate-400 mt-2">👤 关键人物：{item.keyPeople}</p>
                        )}
                        {item.notes && (
                          <p className="text-xs text-slate-400 mt-1 italic">💡 {item.notes}</p>
                        )}
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
      <footer className="border-t border-slate-700 mt-12 py-6 text-center text-sm text-slate-500">
        <p>数据来自飞书多维表格 · 每日自动同步</p>
        <p className="mt-1">竞对情报中心 v1.0 · 月之暗面HR</p>
      </footer>
    </div>
  );
}
