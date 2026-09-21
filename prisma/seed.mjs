// Seed data สำหรับ Shopmallx
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ===== Users =====
  const adminPassword = await bcrypt.hash('admin1234', 10);
  await prisma.user.upsert({
    where: { email: 'admin@shopmallx.com' },
    update: {},
    create: {
      email: 'admin@shopmallx.com',
      password: adminPassword,
      name: 'ผู้ดูแลระบบ',
      phone: '093-000-0000',
      role: 'admin'
    }
  });

  const demoPassword = await bcrypt.hash('12345678', 10);
  await prisma.user.upsert({
    where: { email: 'demo@shopmallx.com' },
    update: {},
    create: {
      email: 'demo@shopmallx.com',
      password: demoPassword,
      name: 'ลูกค้าทดสอบ',
      phone: '081-111-1111',
      role: 'customer'
    }
  });
  console.log('  ✓ Users');

  // ===== Settings =====
  const settings = [
    { key: 'site_name', value: 'SHOPMALLX' },
    { key: 'site_tagline', value: 'ศูนย์รวมสินค้าออนไลน์ ครบวงจร' },
    { key: 'logo_text', value: 'SHOPMALLX' },
    { key: 'phone', value: '093-416-9977' },
    { key: 'email', value: 'contact@shopmallx.com' },
    { key: 'address', value: '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110' },
    { key: 'line_id', value: '@shopmallx' },
    { key: 'facebook', value: 'facebook.com/shopmallx' },
    { key: 'youtube', value: 'youtube.com/@shopmallx' },
    { key: 'bank_name', value: 'ธนาคารกสิกรไทย' },
    { key: 'bank_account', value: '123-4-56789-0' },
    { key: 'bank_holder', value: 'บริษัท ช็อปมอลล์เอ็กซ์ จำกัด' },
    { key: 'shipping_fee', value: '50' },
    { key: 'free_shipping_min', value: '1000' }
  ];
  for (const s of settings) {
    await prisma.setting.upsert({ where: { key: s.key }, update: { value: s.value }, create: s });
  }
  console.log('  ✓ Settings');

  // ===== Categories =====
  const cats = [
    { name: 'ปั๊มน้ำ', slug: 'pump', sortOrder: 1 },
    { name: 'มอเตอร์', slug: 'motor', sortOrder: 2 },
    { name: 'เครื่องมือช่าง', slug: 'tools', sortOrder: 3 },
    { name: 'อุปกรณ์ไฟฟ้า', slug: 'electrical', sortOrder: 4 },
    { name: 'อุปกรณ์เกษตร', slug: 'agriculture', sortOrder: 5 },
    { name: 'คอนเดนเซอร์', slug: 'capacitor', sortOrder: 6 },
    { name: 'ซีลปั๊มน้ำ', slug: 'seal', sortOrder: 7 },
    { name: 'ท่อและข้อต่อ', slug: 'pipe', sortOrder: 8 }
  ];
  for (const c of cats) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }
  const pump = await prisma.category.findUnique({ where: { slug: 'pump' } });
  const motor = await prisma.category.findUnique({ where: { slug: 'motor' } });
  const tools = await prisma.category.findUnique({ where: { slug: 'tools' } });
  const capacitor = await prisma.category.findUnique({ where: { slug: 'capacitor' } });
  const seal = await prisma.category.findUnique({ where: { slug: 'seal' } });
  const pipe = await prisma.category.findUnique({ where: { slug: 'pipe' } });

  const subs = [
    { name: 'ปั๊มซับเมิร์ส', slug: 'submersible-pump', parentId: pump.id },
    { name: 'ปั๊มจุ่ม', slug: 'dive-pump', parentId: pump.id },
    { name: 'ปั๊มหอยโข่ง', slug: 'centrifugal-pump', parentId: pump.id },
    { name: 'ปั๊มอัตโนมัติ', slug: 'auto-pump', parentId: pump.id },
    { name: 'มอเตอร์ฮิตาชิ', slug: 'motor-hitachi', parentId: motor.id },
    { name: 'มอเตอร์ทาซานิ', slug: 'motor-tasani', parentId: motor.id },
    { name: 'เครื่องตัดหญ้า', slug: 'grass-cutter', parentId: tools.id },
    { name: 'หัวพรวนดิน', slug: 'soil-auger', parentId: tools.id }
  ];
  for (const s of subs) {
    await prisma.category.upsert({ where: { slug: s.slug }, update: {}, create: s });
  }
  console.log('  ✓ Categories');

  // ===== Products =====
  const products = [
    {
      name: 'ปั๊มซับเมิร์ส 1 นิ้ว 0.5 HP รุ่นประหยัด',
      slug: 'submersible-pump-1inch-05hp',
      description: 'ปั๊มซับเมิร์สขนาด 1 นิ้ว มอเตอร์ 0.5 HP เหมาะสำหรับบ่อน้ำตื้น ส่งน้ำได้สูงถึง 30 เมตร',
      price: 2890, salePrice: 2590, stock: 25, categoryId: pump.id,
      isFeatured: true, isNew: true, brand: 'TASANI',
      images: JSON.stringify(['https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=600'])
    },
    {
      name: 'ปั๊มจุ่ม 2 นิ้ว 1 HP สแตนเลส',
      slug: 'dive-pump-2inch-1hp',
      description: 'ปั๊มจุ่มสแตนเลสทั้งตัว ทนทานต่อการกัดกร่อน ใช้งานหนักได้',
      price: 4590, salePrice: 3990, stock: 15, categoryId: pump.id,
      isFeatured: true, brand: 'HITACHI',
      images: JSON.stringify(['https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600'])
    },
    {
      name: 'ปั๊มหอยโข่งไฟฟ้า 2 นิ้ว 2 HP',
      slug: 'centrifugal-pump-2inch-2hp',
      description: 'ปั๊มหอยโข่งใบพัดเหล็กหล่อ แรงดันสูง ใช้ในงานเกษตรและอุตสาหกรรม',
      price: 6290, stock: 12, categoryId: pump.id,
      isFeatured: true, brand: 'MITSUBISHI',
      images: JSON.stringify(['https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=600'])
    },
    {
      name: 'ปั๊มน้ำอัตโนมัติ HITACHI 200 วัตต์',
      slug: 'auto-pump-hitachi-200w',
      description: 'ปั๊มอัตโนมัติ เปิด-ปิดเองเมื่อใช้น้ำ ประหยัยไฟ เสียงเงียบ',
      price: 3490, salePrice: 2990, stock: 30, categoryId: pump.id,
      isNew: true, brand: 'HITACHI',
      images: JSON.stringify(['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'])
    }
  ];
  for (const p of products) {
    await prisma.product.upsert({ where: { slug: p.slug }, update: {}, create: p });
  }
  console.log('  ✓ Products batch 1');

  const products2 = [
    {
      name: 'มอเตอร์ฮิตาชิ 3 แรงม้า 3 เฟส',
      slug: 'motor-hitachi-3hp-3phase',
      description: 'มอเตอร์เหนี่ยวนำ 3 เฟส ขนาด 3 HP ประสิทธิภาพสูง',
      price: 5890, stock: 8, categoryId: motor.id,
      isFeatured: true, brand: 'HITACHI',
      images: JSON.stringify(['https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600'])
    },
    {
      name: 'มอเตอร์ทาซานิ 1 แรงม้า 1 เฟส',
      slug: 'motor-tasani-1hp-1phase',
      description: 'มอเตอร์ 1 HP 1 เฟส เหมาะสำหรับงานทั่วไป',
      price: 2890, stock: 20, categoryId: motor.id, brand: 'TASANI',
      images: JSON.stringify(['https://images.unsplash.com/photo-1581092919535-9b4b3eb5a3d8?w=600'])
    },
    {
      name: 'เครื่องตัดหญ้า SWAZER 4 จังหวะ',
      slug: 'grass-cutter-swazer',
      description: 'เครื่องตัดหญ้าแบบสะพายไหล่ เครื่องยนต์ 4 จังหวะ แรงเยอะ',
      price: 4990, salePrice: 4490, stock: 18, categoryId: tools.id,
      isFeatured: true, isNew: true, brand: 'SWAZER',
      images: JSON.stringify(['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600'])
    },
    {
      name: 'หัวพรวนดิน 8 นิ้ว',
      slug: 'soil-auger-8inch',
      description: 'หัวพรวนดินขนาด 8 นิ้ว สำหรับเจาะหลุมปลูกต้นไม้',
      price: 1290, stock: 35, categoryId: tools.id, brand: 'NEWBEAT',
      images: JSON.stringify(['https://images.unsplash.com/photo-1592982537447-7440770faae0?w=600'])
    },
    {
      name: 'คอนเดนเซอร์รันนิ่ง 25 μF 250V',
      slug: 'capacitor-25uf-250v',
      description: 'คอนเดนเซอร์รันนิ่ง มีสายไฟ ขนาด 25 μF 250 โวลต์',
      price: 89, stock: 200, categoryId: capacitor.id, brand: 'GUPPO',
      images: JSON.stringify(['https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=600'])
    },
    {
      name: 'คอนเดนเซอร์สตาร์ท 100 μF 250V',
      slug: 'capacitor-start-100uf',
      description: 'คอนเดนเซอร์สตาร์ทมอเตอร์ 100 μF 250 โวลต์',
      price: 159, stock: 150, categoryId: capacitor.id, brand: 'MECO',
      images: JSON.stringify(['https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=600'])
    },
    {
      name: 'ซีลปั๊มน้ำ CM 70',
      slug: 'seal-cm70',
      description: 'ซีลกันน้ำมัน แมคคานิคอลซีล CM 70 ของแท้',
      price: 290, stock: 80, categoryId: seal.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1581092446327-9b52bd1570c2?w=600'])
    },
    {
      name: 'ข้องอ 90 องศา PVC 1 นิ้ว',
      slug: 'pvc-elbow-90-1inch',
      description: 'ข้องอ PVC 90 องศา ขนาด 1 นิ้ว สำหรับงานประปา',
      price: 25, stock: 500, categoryId: pipe.id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600'])
    }
  ];
  for (const p of products2) {
    await prisma.product.upsert({ where: { slug: p.slug }, update: {}, create: p });
  }
  console.log('  ✓ Products batch 2');

  // ===== Banners =====
  const banners = [
    {
      title: 'ลดสูงสุด 50% ปั๊มน้ำคุณภาพ',
      subtitle: 'ปั๊มน้ำแบรนด์ดัง ส่งฟรีทั่วประเทศ',
      image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=1600&h=600&fit=crop',
      link: '/products?category=pump', position: 'hero', sortOrder: 1
    },
    {
      title: 'เครื่องมือช่าง ราคาช่าง',
      subtitle: 'หลายแบรนด์ดัง ส่งไว ส่งฟรี',
      image: 'https://images.unsplash.com/photo-1581244249288-5cd9d10b4c8d?w=1600&h=600&fit=crop',
      link: '/products?category=tools', position: 'hero', sortOrder: 2
    },
    {
      title: 'อะไหล่แท้ ของแท้ 100%',
      subtitle: 'คอนเดนเซอร์ ซีล และอะไหล่ครบ',
      image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=1600&h=600&fit=crop',
      link: '/products?category=capacitor', position: 'hero', sortOrder: 3
    },
    {
      title: 'โปรโมชั่นพิเศษ',
      subtitle: 'เฉพาะสมาชิกเท่านั้น',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=400&fit=crop',
      link: '/howto', position: 'sidebar', sortOrder: 1
    }
  ];
  for (const b of banners) {
    const exists = await prisma.banner.findFirst({ where: { title: b.title } });
    if (!exists) await prisma.banner.create({ data: b });
  }
  console.log('  ✓ Banners');

  // ===== Promotions =====
  const promotions = [
    { title: 'ส่งฟรี', description: 'เมื่อซื้อครบ 1,000 บาท', badge: 'FREE', sortOrder: 1 },
    { title: 'ส่วนลด 10%', description: 'สำหรับสมาชิกใหม่', badge: '-10%', sortOrder: 2 },
    { title: 'ผ่อน 0%', description: 'สำหรับยอด 3,000 บาทขึ้นไป', badge: '0%', sortOrder: 3 },
    { title: 'ของแท้ 100%', description: 'มั่นใจได้ทุกชิ้น', badge: 'OG', sortOrder: 4 }
  ];
  for (const p of promotions) {
    const exists = await prisma.promotion.findFirst({ where: { title: p.title } });
    if (!exists) await prisma.promotion.create({ data: p });
  }
  console.log('  ✓ Promotions');

  // ===== Contents =====
  const contents = [
    {
      key: 'about',
      title: 'เกี่ยวกับเรา',
      body: 'SHOPMALLX ศูนย์รวมสินค้าออนไลน์ อะไหล่ปั๊มน้ำ มอเตอร์ เครื่องมือช่าง ไฟฟ้า และอุปกรณ์เกษตรครบวงจร สินค้าทุกชิ้นมีสต๊อกพร้อมส่ง ไม่ว่าจะเป็นสินค้ารุ่นเก่า รุ่นใหม่ อะไหล่แท้ หรืออะไหล่เทียบ หากคุณเป็นร้านค้าหรือช่างซ่อม ที่กำลังมองหาอะไหล่ไปจำหน่ายหรือซ่อมแซมให้กับลูกค้า SHOPMALLX ตอบโจทย์นี้ให้คุณได้อย่างแน่นอน'
    },
    {
      key: 'howto',
      title: 'วิธีการสั่งซื้อสินค้า',
      body: '1. เลือกสินค้าที่ต้องการ แล้วกดเพิ่มลงตะกร้า\n2. เมื่อเลือกครบแล้ว กดเข้าสู่ระบบหรือสมัครสมาชิก\n3. กรอกข้อมูลการจัดส่ง\n4. เลือกวิธีการชำระเงิน (โอนผ่านธนาคาร)\n5. แจ้งการชำระเงินพร้อมแนบสลิป\n6. รอการยืนยันจากทางร้าน จากนั้นจัดส่งสินค้าให้ภายใน 1-3 วันทำการ'
    },
    {
      key: 'contact',
      title: 'ติดต่อเรา',
      body: 'โทร: 093-416-9977\nอีเมล: contact@shopmallx.com\nLine: @shopmallx\nFacebook: facebook.com/shopmallx\nที่อยู่: 123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110'
    },
    {
      key: 'policy',
      title: 'นโยบายการคืนสินค้า',
      body: 'สินค้าสามารถคืนได้ภายใน 7 วันหลังจากได้รับสินค้า โดยสินค้าต้องอยู่ในสภาพเดิมไม่ผ่านการใช้งาน พร้อมบรรจุภัณฑ์ครบถ้วน กรุณาติดต่อทางร้านก่อนทำการคืนสินค้าทุกครั้ง'
    }
  ];
  for (const c of contents) {
    await prisma.content.upsert({ where: { key: c.key }, update: { title: c.title, body: c.body }, create: c });
  }
  console.log('  ✓ Contents');

  console.log('✅ Seed complete!');
  console.log('   Admin: admin@shopmallx.com / admin1234');
  console.log('   Customer: demo@shopmallx.com / 12345678');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());