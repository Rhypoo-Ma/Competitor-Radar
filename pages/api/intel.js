// Mock data - replace with Feishu Bitable API when ready
const mockData = [
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

export default function handler(req, res) {
  res.status(200).json({ data: mockData });
}
