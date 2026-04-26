export interface StoryImage {
  url: string;
  alt: string;
  caption?: string;
}

export const paragraphImages: Record<string, StoryImage> = {
  'p1-1': {
    url: '/images/01_senbei_shop.png',
    alt: '人形町的仙贝店',
    caption: '甜咸味的店门口，日常生意和命案调查第一次贴到一起。',
  },
  'p1-4': {
    url: '/images/01_senbei_shop.png',
    alt: '仙贝店里的问询',
    caption: '加贺的问法不像逼供，更像把街坊记忆一点点擦亮。',
  },
  'p2-1': {
    url: '/images/02_ryotei_apprentice.png',
    alt: '料亭的小伙计',
    caption: '后厨走廊里，年轻人隐瞒的不是大事，却足以误导时间线。',
  },
  'p2-5': {
    url: '/images/02_ryotei_apprentice.png',
    alt: '料亭里的服务动线',
    caption: '托盘、账单和换班时间，成为加贺重新排列的一组证词。',
  },
  'p3-1': {
    url: '/images/03_ceramics_wife.png',
    alt: '陶瓷器店的媳妇',
    caption: '瓷器店的整洁外表下，藏着一段没有说出口的家庭裂缝。',
  },
  'p3-5': {
    url: '/images/03_ceramics_wife.png',
    alt: '陶瓷器店柜台',
    caption: '一条手巾、一句辩解，指向的不是凶器，而是人的软肋。',
  },
  'p4-1': {
    url: '/images/04_clock_shop_dog.png',
    alt: '钟表店的狗',
    caption: '钟表店里每一次齿轮卡顿，都像在提醒某个被错放的时间。',
  },
  'p4-5': {
    url: '/images/04_clock_shop_dog.png',
    alt: '旧钟表与店里的狗',
    caption: '狗记得人的气味，老店记得人的习惯。',
  },
  'p5-1': {
    url: '/images/05_pastry_clerk.png',
    alt: '西饼店的店员',
    caption: '蛋糕柜台前的选择，看似甜腻，实则牵出一个人的退路。',
  },
  'p5-6': {
    url: '/images/05_pastry_clerk.png',
    alt: '西饼店柜台',
    caption: '收据、预约和一句随口解释，拼出受害者最后几小时的轮廓。',
  },
  'p6-1': {
    url: '/images/06_translator_friend.png',
    alt: '翻译家的朋友',
    caption: '书稿、电话和沉默的朋友，把受害者从“死者”还原成一个人。',
  },
  'p6-5': {
    url: '/images/06_translator_friend.png',
    alt: '翻译家的书桌',
    caption: '加贺真正追问的是：谁在替谁守住体面。',
  },
  'p7-1': {
    url: '/images/07_cleaning_company.png',
    alt: '保洁公司的社长',
    caption: '小公司的账本和钥匙，连接着案发现场最实际的可能性。',
  },
  'p7-5': {
    url: '/images/07_cleaning_company.png',
    alt: '保洁公司办公室',
    caption: '清扫痕迹不一定是犯罪，逃避责任却会留下新的痕迹。',
  },
  'p8-1': {
    url: '/images/08_folk_art_customer.png',
    alt: '民间艺术品店的顾客',
    caption: '手工艺品店里，礼物的去向比礼物本身更重要。',
  },
  'p8-6': {
    url: '/images/08_folk_art_customer.png',
    alt: '民艺店的顾客',
    caption: '人形町的每家店，都是一段关系的入口。',
  },
  'p9-1': {
    url: '/images/09_nihonbashi_detective.png',
    alt: '日本桥的刑警',
    caption: '日本桥上，加贺把前八章的碎片收束成一条人的动机。',
  },
  'p9-7': {
    url: '/images/09_nihonbashi_detective.png',
    alt: '加贺恭一郎走过日本桥',
    caption: '真相不是炫技的反转，而是所有人都必须面对的关系账。',
  },
  'p1-8': {
    url: '/images/10_senbei_documents.png',
    alt: '仙贝店柜台上的保险文件',
    caption: '诊断证明、茶杯和仙贝袋，把命案第一次压进普通家庭的桌面。',
  },
  'p2-8': {
    url: '/images/11_ryotei_delivery_note.png',
    alt: '料亭后厨的外送单',
    caption: '一张外送单让加贺重新计算后门、街口和证词之间的距离。',
  },
  'p3-8': {
    url: '/images/12_ceramics_towel.png',
    alt: '陶瓷器店柜台上的手巾',
    caption: '手巾被解释得越轻，背后的家庭压力就越重。',
  },
  'p4-8': {
    url: '/images/13_clock_repair_ticket.png',
    alt: '钟表店的修理单',
    caption: '时间不是被钟表记录下来，而是被人有意整理过。',
  },
  'p5-8': {
    url: '/images/14_pastry_receipt.png',
    alt: '西饼店的蛋糕收据',
    caption: '收据像一帧定格，把最后几小时缩成可追问的窗口。',
  },
  'p6-8': {
    url: '/images/15_translator_phone.png',
    alt: '翻译家桌上的电话',
    caption: '没有说完的电话，让沉默也变成了证词。',
  },
  'p7-8': {
    url: '/images/16_cleaning_keys.png',
    alt: '保洁公司的备用钥匙墙',
    caption: '钥匙、排班和责任边界，是最现实的进入方式。',
  },
  'p8-8': {
    url: '/images/17_folk_art_gift.png',
    alt: '民艺店包装好的礼物',
    caption: '礼物不是装饰，它是受害者最后仍想维系的关系。',
  },
  'p9-8': {
    url: '/images/19_kaga_route_notebook.png',
    alt: '加贺的人形町路线笔记',
    caption: '九家店被画成一条路线，日常终于成为完整证词。',
  },
};
