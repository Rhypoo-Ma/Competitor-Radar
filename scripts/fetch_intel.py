#!/usr/bin/env python3
"""竞品情报自动抓取脚本
从多个AI新闻源抓取竞品动态，AI分类后写入飞书多维表格。"""

import json
import os
import re
import subprocess
import sys
import time
from datetime import datetime, timedelta
from urllib.parse import urljoin

import requests

# ========== 配置 ==========
COMPETITOR_COMPANIES = [
    "字节跳动", "字节", "抖音", "TikTok", "Flow",
    "阿里巴巴", "阿里", "通义", "通义千问", "Qwen", "夸克",
    "百度", "文心一言", "文心", "Apollo",
    "腾讯", "混元", "Hunyuan",
    "MiniMax", "稀宇科技",
    "智谱AI", "智谱", "ChatGLM", "GLM",
    "月之暗面", "Kimi",
    "阶跃星辰", "Step",
    "百川智能", "Baichuan",
    "零一万物", "01.AI", "Yi",
    "DeepSeek", "深度求索",
    "商汤", "SenseTime",
    "科大讯飞", "讯飞",
    "华为", "盘古",
    "美团", "滴滴", "京东",
    "OpenAI", "Anthropic", "Claude", "Google", "Gemini", "Meta", "Llama",
]

INTEL_TYPES = ["组织架构", "人才流动", "融资", "产品", "招聘", "合作"]
IMPACT_LEVELS = ["高", "中", "低"]

# 飞书多维表格配置
APP_TOKEN = "ZWWZbnLhxaraYtsj05jcEGyen5b"
TABLE_ID = "tblPI9yXZi6bHXRy"

# ========== Token 获取 ==========
GET_TOKEN_JS = r"""
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
"""


def get_access_token():
    result = subprocess.run(["node", "-e", GET_TOKEN_JS], capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error getting token: {result.stderr}", file=sys.stderr)
        sys.exit(1)
    return result.stdout.strip()


# ========== 飞书 API ==========
def bitable_list_records(token, page_size=500):
    """列出所有已存在的记录（用于去重）"""
    url = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{APP_TOKEN}/tables/{TABLE_ID}/records"
    headers = {"Authorization": f"Bearer {token}"}
    records = []
    page_token = None
    while True:
        params = {"page_size": page_size}
        if page_token:
            params["page_token"] = page_token
        resp = requests.get(url, headers=headers, params=params)
        data = resp.json()
        if data.get("code") != 0:
            print(f"List records error: {data}", file=sys.stderr)
            break
        records.extend(data["data"]["items"])
        if not data["data"].get("has_more", False):
            break
        page_token = data["data"].get("page_token")
    return records


def bitable_create_records(token, records):
    """批量创建记录"""
    url = f"https://open.feishu.cn/open-apis/bitable/v1/apps/{APP_TOKEN}/tables/{TABLE_ID}/records/batch_create"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    payload = {"records": [{"fields": r} for r in records]}
    resp = requests.post(url, headers=headers, json=payload)
    data = resp.json()
    if data.get("code") != 0:
        print(f"Create records error: {json.dumps(data, ensure_ascii=False, indent=2)}", file=sys.stderr)
        return False
    return True


# ========== 抓取逻辑（无bs4，纯正则+requests） ==========

def extract_text_from_html(html):
    """简单HTML标签去除"""
    # 移除script/style
    html = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL)
    html = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.DOTALL)
    # 移除标签
    html = re.sub(r'<[^>]+>', ' ', html)
    # 解码实体
    html = html.replace('&nbsp;', ' ').replace('&quot;', '"').replace('&lt;', '<').replace('&gt;', '>').replace('&amp;', '&')
    # 合并空白
    html = re.sub(r'\s+', ' ', html).strip()
    return html


def fetch_36kr():
    """抓取36kr AI相关新闻"""
    items = []
    try:
        url = "https://36kr.com/search/articles/AI"
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        }
        resp = requests.get(url, headers=headers, timeout=15)
        text = extract_text_from_html(resp.text)
        
        # 36kr文章通常在链接和标题中
        # 匹配文章列表项：包含标题、链接、摘要
        article_blocks = re.findall(
            r'<a[^>]*href="(/p/\d+\.html)"[^>]*>.*?<[^>]*>([^<]{10,80})</[^>]*>',
            resp.text
        )
        
        for link, title in article_blocks[:15]:
            title = re.sub(r'<[^>]+>', '', title).strip()
            if not title or len(title) < 10:
                continue
            
            full_link = urljoin("https://36kr.com", link)
            
            # 匹配竞品公司
            matched_company = None
            for company in COMPETITOR_COMPANIES:
                if company in title:
                    matched_company = company
                    break
            
            if matched_company:
                items.append({
                    "title": title,
                    "summary": "",
                    "link": full_link,
                    "date": datetime.now().strftime("%Y-%m-%d"),
                    "company": matched_company,
                    "source": "36kr",
                })
    except Exception as e:
        print(f"Fetch 36kr error: {e}")
    return items


def fetch_jiqizhixin():
    """抓取机器之心"""
    items = []
    try:
        url = "https://www.jiqizhixin.com/"
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        }
        resp = requests.get(url, headers=headers, timeout=15)
        
        # 匹配文章
        article_blocks = re.findall(
            r'<a[^>]*href="(/articles/\d{4}-\d{2}-\d{2}/[^"]+)"[^>]*>.*?<[^>]*>([^<]{10,80})</[^>]*>',
            resp.text
        )
        
        for link, title in article_blocks[:15]:
            title = re.sub(r'<[^>]+>', '', title).strip()
            if not title or len(title) < 10:
                continue
            
            full_link = urljoin("https://www.jiqizhixin.com", link)
            
            matched_company = None
            for company in COMPETITOR_COMPANIES:
                if company in title:
                    matched_company = company
                    break
            
            if matched_company:
                items.append({
                    "title": title,
                    "summary": "",
                    "link": full_link,
                    "date": datetime.now().strftime("%Y-%m-%d"),
                    "company": matched_company,
                    "source": "机器之心",
                })
    except Exception as e:
        print(f"Fetch jiqizhixin error: {e}")
    return items


def fetch_qbitai():
    """抓取量子位"""
    items = []
    try:
        url = "https://www.qbitai.com/"
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        }
        resp = requests.get(url, headers=headers, timeout=15)
        
        # 匹配文章标题和链接
        article_blocks = re.findall(
            r'<a[^>]*href="(https://www\.qbitai\.com/\d{4}/\d{2}/\d{2}/[^"]+)"[^>]*>.*?<[^>]*>([^<]{10,80})</[^>]*>',
            resp.text
        )
        
        for link, title in article_blocks[:15]:
            title = re.sub(r'<[^>]+>', '', title).strip()
            if not title or len(title) < 10:
                continue
            
            matched_company = None
            for company in COMPETITOR_COMPANIES:
                if company in title:
                    matched_company = company
                    break
            
            if matched_company:
                items.append({
                    "title": title,
                    "summary": "",
                    "link": link,
                    "date": datetime.now().strftime("%Y-%m-%d"),
                    "company": matched_company,
                    "source": "量子位",
                })
    except Exception as e:
        print(f"Fetch qbitai error: {e}")
    return items


def parse_date(date_str):
    """解析日期字符串"""
    try:
        for fmt in ["%Y-%m-%d", "%Y/%m/%d", "%m月%d日", "%Y-%m-%d %H:%M", "%m-%d"]:
            try:
                return datetime.strptime(date_str, fmt).strftime("%Y-%m-%d")
            except ValueError:
                continue
        if "小时前" in date_str:
            hours = int(re.search(r'(\d+)', date_str).group(1))
            return (datetime.now() - timedelta(hours=hours)).strftime("%Y-%m-%d")
        if "天前" in date_str:
            days = int(re.search(r'(\d+)', date_str).group(1))
            return (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
    except Exception:
        pass
    return datetime.now().strftime("%Y-%m-%d")


def classify_intel(title, summary):
    """用关键词规则分类情报类型和影响等级"""
    text = title + " " + summary
    
    intel_type = "产品"
    type_keywords = {
        "组织架构": ["组织架构", "架构调整", "部门", "重组", "合并", "拆分", "负责人更换", "离职", "负责人", "CTO", "CEO"],
        "人才流动": ["离职", "加入", "跳槽", "挖角", "招揽", "人才引进", "科学家", "负责人", "首席"],
        "融资": ["融资", "估值", "亿美元", "轮融资", "战略融资", "投资", "上市", "IPO", "并购", "收购"],
        "产品": ["发布", "上线", "模型", "更新", "版本", "推出", "API", "开源", "产品", "功能"],
        "招聘": ["招聘", "扩招", "岗位", "招人", "年薪", "package", "薪资", "人才", "校招", "社招"],
        "合作": ["合作", "签约", "协议", "落地", "政务", "ToG", "B端", "政府", " partnership", "联盟"],
    }
    
    for itype, keywords in type_keywords.items():
        for kw in keywords:
            if kw in text:
                intel_type = itype
                break
        if intel_type != "产品":
            break
    
    impact = "中"
    high_keywords = ["首席", "创始人", "CEO", "CTO", "负责人", "融资", "上市", "并购", "收购", "架构调整", "大规模", "亿元", "亿美元"]
    low_keywords = ["小更新", "优化", "修复", "微调"]
    
    for kw in high_keywords:
        if kw in text:
            impact = "高"
            break
    if impact == "中":
        for kw in low_keywords:
            if kw in text:
                impact = "低"
                break
    
    key_people = ""
    people_patterns = [
        r"([\u4e00-\u9fa5]{2,4})(?:离职|加入|跳槽|出任|担任|任命为)",
        r"(?:首席|创始人|负责人|CEO|CTO)\s*([\u4e00-\u9fa5]{2,4})",
    ]
    for pattern in people_patterns:
        match = re.search(pattern, text)
        if match:
            key_people = match.group(1)
            break
    
    return intel_type, impact, key_people


# ========== 主流程 ==========

def main():
    print(f"[{datetime.now()}] 开始抓取竞品情报...")
    
    token = get_access_token()
    print("Token获取成功")
    
    existing_records = bitable_list_records(token)
    existing_titles = set()
    for r in existing_records:
        fields = r.get("fields", {})
        title = fields.get("标题", "")
        if isinstance(title, list) and title:
            title = title[0].get("text", "")
        existing_titles.add(title)
    print(f"已有 {len(existing_titles)} 条记录")
    
    all_items = []
    all_items.extend(fetch_36kr())
    all_items.extend(fetch_jiqizhixin())
    all_items.extend(fetch_qbitai())
    
    print(f"共抓取 {len(all_items)} 条竞品相关新闻")
    
    new_items = []
    for item in all_items:
        if item["title"] in existing_titles:
            continue
        
        intel_type, impact, key_people = classify_intel(item["title"], item["summary"])
        
        date_obj = datetime.strptime(item["date"], "%Y-%m-%d")
        date_timestamp = int(date_obj.timestamp() * 1000)
        
        new_items.append({
            "公司": item["company"],
            "类型": intel_type,
            "标题": item["title"],
            "摘要": item["summary"],
            "日期": date_timestamp,
            "来源链接": {"link": item["link"], "text": item["source"]},
            "影响等级": impact,
            "关键人物": key_people,
            "状态": "待审核",
            "备注": f"来源：{item['source']}",
        })
    
    print(f"新发现 {len(new_items)} 条未记录的情报")
    
    if new_items:
        batch_size = 100
        for i in range(0, len(new_items), batch_size):
            batch = new_items[i:i+batch_size]
            success = bitable_create_records(token, batch)
            if success:
                print(f"成功写入 {len(batch)} 条记录")
            else:
                print(f"写入失败: batch {i}")
            time.sleep(1)
    else:
        print("没有新情报需要写入")
    
    print(f"[{datetime.now()}] 抓取完成")


if __name__ == "__main__":
    main()
