// 飞书 API 路由 — 从多维表格读取竞品情报
import { execSync } from 'child_process';

const APP_TOKEN = 'ZWWZbnLhxaraYtsj05jcEGyen5b';
const TABLE_ID = 'tblPI9yXZi6bHXRy';

function getToken() {
  const js = `
    const crypto = require('crypto');
    const fs = require('fs');
    const path = require('path');
    const UAT_DIR = path.join(process.env.HOME, '.local/share/openclaw-feishu-uat');
    const KEY = fs.readFileSync(path.join(UAT_DIR, 'master.key'));
    const account = 'cli_a94e0d54d4f81bb5_ou_93806746117b524f5be3371d2f6ab52b';
    const safe = account.replace(/[^a-zA-Z0-9._-]/g, '_') + '.enc';
    const data = fs.readFileSync(path.join(UAT_DIR, safe));
    const iv = data.subarray(0, 12);
    const tag = data.subarray(12, 28);
    const enc = data.subarray(28);
    const d = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
    d.setAuthTag(tag);
    const plain = Buffer.concat([d.update(enc), d.final()]).toString('utf8');
    console.log(JSON.parse(plain).accessToken);
  `;
  return execSync(`node -e "${js}"`, { encoding: 'utf8' }).trim();
}

export default async function handler(req, res) {
  try {
    const token = getToken();
    
    // 从飞书读取记录（只读已发布的+待审核的，按日期倒序）
    const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${TABLE_ID}/records?page_size=500`;
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await resp.json();
    
    if (data.code !== 0) {
      throw new Error(data.msg || 'Feishu API error');
    }
    
    const records = data.data.items.map(item => {
      const f = item.fields;
      // 处理飞书返回的富文本/特殊格式
      const getText = (v) => {
        if (typeof v === 'string') return v;
        if (Array.isArray(v) && v.length > 0 && v[0].text) return v[0].text;
        if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'string') return v[0];
        return '';
      };
      const getSingleSelect = (v) => {
        if (typeof v === 'string') return v;
        if (Array.isArray(v) && v.length > 0) return v[0];
        return '';
      };
      
      // 日期处理：飞书返回毫秒时间戳
      let dateStr = '';
      const dateVal = f['日期'];
      if (typeof dateVal === 'number') {
        dateStr = new Date(dateVal).toISOString().split('T')[0];
      } else if (typeof dateVal === 'string') {
        dateStr = dateVal;
      }
      
      // 来源链接处理
      let sourceUrl = '';
      const linkVal = f['来源链接'];
      if (linkVal && typeof linkVal === 'object') {
        sourceUrl = linkVal.link || linkVal.text || '';
      } else if (typeof linkVal === 'string') {
        sourceUrl = linkVal;
      }
      
      return {
        id: item.record_id,
        company: getSingleSelect(f['公司']) || getText(f['公司']),
        type: getSingleSelect(f['类型']),
        title: getText(f['标题']),
        summary: getText(f['摘要']),
        date: dateStr || new Date().toISOString().split('T')[0],
        source: sourceUrl,
        impact: getSingleSelect(f['影响等级']),
        keyPeople: getText(f['关键人物']),
        notes: getText(f['备注']),
        status: getSingleSelect(f['状态'])
      };
    }).filter(r => r.status !== '已忽略'); // 过滤已忽略的
    
    res.status(200).json({ data: records });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
