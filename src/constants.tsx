export interface AICase {
  id: string;
  title: string;
  category: 'Content' | 'SaaS' | 'Service' | 'E-commerce' | 'Automation';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  potential: string; // e.g., "$1,000 - $10,000 / mo"
  summary: string;
  fullAnalysis: string;
  tools: string[];
  tags: string[];
  icon: string;
}

export const AI_CASES: AICase[] = [
  {
    id: '1',
    title: 'AI 驱动的垂直领域小报 (Newsletter)',
    category: 'Content',
    difficulty: 'Easy',
    potential: '月入 $2,000 - $5,000',
    summary: '利用 AI 自动化收集、总结和分发特定行业的深度资讯。',
    fullAnalysis: `
### 核心逻辑
通过 AI (如 Gemini) 每天抓取特定领域（如：新能源、AI 医疗、跨境电商）的最新资讯，自动生成摘要和深度评论，通过邮件订阅平台（如 Substack, Beehiiv）发送给订阅者。

### 赚钱路径
1. **付费订阅**：提供更深度的独家分析。
2. **广告赞助**：在小报中植入行业相关的广告。
3. **引流转化**：将流量引导至自己的课程或咨询服务。

### 关键步骤
- **选品**：选择一个高价值、信息差大的垂直领域。
- **自动化流**：使用 Make.com 或 Zapier 连接 RSS 源和 Gemini API。
- **内容调优**：设定特定的 System Prompt，确保 AI 生成的内容具有独特的视角。
    `,
    tools: ['Gemini API', 'Substack', 'Make.com', 'Feedly'],
    tags: ['内容创业', '自动化', '被动收入'],
    icon: 'Mail'
  },
  {
    id: '2',
    title: 'AI 模特与虚拟时尚博主',
    category: 'Service',
    difficulty: 'Medium',
    potential: '单次合作 $500 - $2,000',
    summary: '创建高度逼真的 AI 虚拟人物，为服装品牌提供拍摄和代言服务。',
    fullAnalysis: `
### 核心逻辑
利用 Stable Diffusion 或 Midjourney 生成具有辨识度的 AI 模特，通过一致性插件（如 IP-Adapter）保持人物形象稳定。在社交媒体（Instagram, 小红书）运营账号，积累粉丝。

### 赚钱路径
1. **品牌代言**：为服装、美妆品牌拍摄宣传照。
2. **电商商拍**：为淘宝、亚马逊卖家提供低成本的模特图。
3. **内容分成**：参与平台的创作者激励计划。

### 关键步骤
- **人设打造**：赋予 AI 模特独特的性格和生活背景。
- **技术攻克**：掌握人物一致性技术和局部重绘（Inpainting）。
- **商务拓展**：主动联系中小品牌提供样片。
    `,
    tools: ['Stable Diffusion', 'Midjourney', 'Photoshop'],
    tags: ['视觉艺术', '电商', '社交媒体'],
    icon: 'Camera'
  },
  {
    id: '3',
    title: 'AI 自动化 SEO 流量站',
    category: 'SaaS',
    difficulty: 'Hard',
    potential: '月入 $5,000 - $20,000+',
    summary: '利用 AI 批量生成高质量 SEO 文章，建立庞大的流量矩阵。',
    fullAnalysis: `
### 核心逻辑
针对长尾关键词，利用 AI 批量撰写符合 SEO 逻辑的文章。通过程序化建站，快速覆盖数千个关键词，获取搜索流量。

### 赚钱路径
1. **Google AdSense**：通过展示广告获取收益。
2. **联盟营销 (Affiliate)**：在文章中插入 Amazon 或其他平台的推广链接。
3. **卖站**：当流量稳定后，在 Flippa 等平台高价出售。

### 关键步骤
- **关键词挖掘**：使用 Ahrefs 或 Semrush 寻找竞争小、流量大的词。
- **内容质量控制**：避免 AI 痕迹过重，加入人工校对和独特数据。
- **外链建设**：提高网站权重。
    `,
    tools: ['Gemini API', 'WordPress', 'Ahrefs', 'SurferSEO'],
    tags: ['SEO', '流量', '联盟营销'],
    icon: 'Search'
  }
];
