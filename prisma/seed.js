const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  console.log('Sedang membersihkan database...');
  // Hapus urutan terbalik untuk menghindari error foreign key
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.review.deleteMany(); 
  await prisma.wishlist.deleteMany(); 
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  console.log('Memulai proses seeding...');

  // HASH PASSWORD
  const adminPassword = await bcrypt.hash('admin123', 10);
  const customerPassword = await bcrypt.hash('customer123', 10);

  // 1. Seed Categories
  const categoriesData = [
    { id: 'cat1', name: 'Susu Formula', slug: 'susu-formula', description: 'Susu formula untuk bayi dan balita dari berbagai merek terpercaya', icon: '🍼', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { id: 'cat2', name: 'MPASI & Makanan', slug: 'mpasi-makanan', description: 'Makanan pendamping ASI untuk bayi 6 bulan ke atas', icon: '🥣', color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { id: 'cat3', name: 'Vitamin & Suplemen', slug: 'vitamin-suplemen', description: 'Vitamin dan suplemen untuk tumbuh kembang optimal', icon: '💊', color: 'text-green-600', bgColor: 'bg-green-50' },
    { id: 'cat4', name: 'Perawatan Bayi', slug: 'perawatan-bayi', description: 'Produk perawatan kulit dan tubuh bayi yang lembut', icon: '🧴', color: 'text-pink-600', bgColor: 'bg-pink-50' },
    { id: 'cat5', name: 'Peralatan Makan', slug: 'peralatan-makan', description: 'Perlengkapan makan dan minum bayi berkualitas', icon: '🥄', color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { id: 'cat6', name: 'Mainan & Aksesoris', slug: 'mainan-aksesoris', description: 'Mainan edukatif dan aksesoris bayi yang aman', icon: '🎮', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  ];

  for (const cat of categoriesData) {
    await prisma.category.create({ data: cat });
  }

  // 2. Seed Products
  const productsData = [
    {
      id: 'prod1', name: 'SGM Bunda Susu Ibu Hamil Vanilla 400g', slug: 'sgm-bunda-vanilla-400g',
      categoryId: 'cat1', price: 85000, originalPrice: 95000,
      stock: 50, soldCount: 1250, weight: 400,
      image: 'https://res.cloudinary.com/dwjuyd3xj/image/upload/v1778956282/sgm_c47k0n.webp', bgColor: 'bg-blue-100',
      description: 'SGM Bunda adalah susu khusus untuk ibu hamil dan menyusui...',
      ingredients: 'Susu skim, gula, minyak nabati, DHA, AA...',
      isNew: false, isBestSeller: true, isFeatured: true, isActive: true,
    },
    {
      id: 'prod2', name: 'Enfagrow A+ Three 1-3 Tahun 800g', slug: 'enfagrow-a-plus-three-800g',
      categoryId: 'cat1', price: 285000, originalPrice: 320000,
      stock: 35, soldCount: 2100, weight: 800,
      image: 'https://res.cloudinary.com/dwjuyd3xj/image/upload/v1778956272/enfagrow_xubgpu.webp', bgColor: 'bg-sky-100',
      description: 'Enfagrow A+ Three adalah susu pertumbuhan untuk anak usia 1-3 tahun...',
      ingredients: 'Skim milk, vegetable oil, lactose, MFGM, DHA, AA...',
      isNew: false, isBestSeller: true, isFeatured: true, isActive: true,
    },
    {
      id: 'prod3', name: 'Bebelac 3 Susu Pertumbuhan Madu 900g', slug: 'bebelac-3-madu-900g',
      categoryId: 'cat1', price: 195000, originalPrice: 220000, stock: 42, 
      soldCount: 1650, weight: 900, image: 'https://res.cloudinary.com/dwjuyd3xj/image/upload/v1778956255/bebelac_bebelac_3_madu_susu_formula_-1000_g-box-_full03_s6q3u6mb_pmqo9g.webp', bgColor: 'bg-amber-100',
      description: 'Bebelac 3 hadir dengan rasa madu yang disukai anak. Mengandung Prebiotik GOS yang mendukung sistem imun.',
      ingredients: 'Susu skim, laktosa, minyak nabati, GOS, Vitamin D, Kalsium, Zat Besi',
      isNew: false, isBestSeller: true, isFeatured: false, isActive: true,
    },
    {
      id: 'prod4', name: 'Frisian Flag 123 Jelajah Madu 900g', slug: 'frisian-flag-123-madu-900g',
      categoryId: 'cat1', price: 175000, originalPrice: 195000, stock: 60, 
      soldCount: 1420, weight: 900, image: 'https://res.cloudinary.com/dwjuyd3xj/image/upload/v1778956271/frisianflag_ltisdt.jpg', bgColor: 'bg-blue-100',
      description: 'Frisian Flag 123 Jelajah adalah susu pertumbuhan lengkap untuk anak 1-3 tahun. Mengandung Trigold.',
      ingredients: 'Susu skim, laktosa, DHA, Lutein, Kolin, Vitamin D, Kalsium',
      isNew: false, isBestSeller: false, isFeatured: true, isActive: true,
    },
    {
      id: 'prod5', name: 'S-26 Procal Gold Susu Formula 900g', slug: 's26-procal-gold-900g',
      categoryId: 'cat1', price: 320000, originalPrice: 350000, stock: 25, 
      soldCount: 890, weight: 900, image: 'https://res.cloudinary.com/dwjuyd3xj/image/upload/v1778956271/procal_taoec3.jpg', bgColor: 'bg-yellow-100',
      description: 'S-26 Procal Gold adalah susu formula premium untuk anak 3-12 tahun. Mengandung Procalbiotic.',
      ingredients: 'Susu skim, whey protein, DHA, Procalbiotic, Kalsium, Fosfor',
      isNew: true, isBestSeller: false, isFeatured: true, isActive: true,
    },
    {
      id: 'prod6', name: 'Morinaga Chil Kid Rasa Madu 800g', slug: 'morinaga-chil-kid-madu-800g',
      categoryId: 'cat1', price: 245000, originalPrice: 270000, stock: 30, 
      soldCount: 780, weight: 800, image: 'https://res.cloudinary.com/dwjuyd3xj/image/upload/v1778956246/morinaga_morinaga-chil-kid-reguler-madu-susu-formula--800-g-_full02_aiveay.webp', bgColor: 'bg-amber-50',
      description: 'Morinaga Chil Kid mengandung BifidusBB12 yang terbukti klinis mendukung sistem imun.',
      ingredients: 'Susu skim, BifidusBB12, DHA, Kolin, Vitamin A, C, D, E',
      isNew: false, isBestSeller: false, isFeatured: false, isActive: true,
    },
    {
      id: 'prod7', name: 'Promina Bubur Bayi Tim Ayam 120g', slug: 'promina-bubur-ayam-120g',
      categoryId: 'cat2', price: 18500, originalPrice: 22000, stock: 100, 
      soldCount: 3200, weight: 120, image: 'https://res.cloudinary.com/dwjuyd3xj/image/upload/v1778956244/promina_promina_bubur_bayi_6-_tim_ayam_jamur_120g_full02_r7w6feca_ihrzpp.webp', bgColor: 'bg-orange-100',
      description: 'Promina Bubur Bayi Tim Ayam adalah makanan bayi siap saji untuk usia 8+ bulan.',
      ingredients: 'Tepung beras, ayam, wortel, bayam, susu skim, minyak nabati',
      isNew: false, isBestSeller: true, isFeatured: true, isActive: true,
    },
    {
      id: 'prod8', name: 'Milna Biskuit Bayi Original 6+ Bulan 130g', slug: 'milna-biskuit-bayi-130g',
      categoryId: 'cat2', price: 26000, originalPrice: 30000, stock: 80, 
      soldCount: 2400, weight: 130, image: 'https://res.cloudinary.com/dwjuyd3xj/image/upload/v1778956245/milnabiskui_a3pbmc.webp', bgColor: 'bg-yellow-50',
      description: 'Milna Biskuit Bayi adalah snack sehat untuk bayi usia 6+ bulan. Teksturnya mudah larut.',
      ingredients: 'Tepung gandum, susu, gula, DHA, Vitamin B kompleks, Kalsium',
      isNew: false, isBestSeller: true, isFeatured: false, isActive: true,
    },
    {
      id: 'prod9', name: 'Heinz Chicken Rice Cereal 125g', slug: 'heinz-chicken-rice-cereal-125g',
      categoryId: 'cat2', price: 35000, originalPrice: 42000, stock: 45, 
      soldCount: 1100, weight: 125, image: 'https://res.cloudinary.com/dwjuyd3xj/image/upload/v1778956247/heinzchicken_r4krye.png', bgColor: 'bg-red-50',
      description: 'Heinz Chicken Rice Cereal adalah MPASI impor berkualitas untuk bayi 6+ bulan.',
      ingredients: 'Tepung beras, ayam asli, Vitamin C, Zat Besi, Kalsium',
      isNew: false, isBestSeller: false, isFeatured: true, isActive: true,
    },
    {
      id: 'prod10', name: 'SUN Rice Cereal Sari Buah 120g', slug: 'sun-rice-cereal-sari-buah-120g',
      categoryId: 'cat2', price: 28000, originalPrice: 32000, stock: 65, 
      soldCount: 1560, weight: 120, image: 'https://res.cloudinary.com/dwjuyd3xj/image/upload/v1778956284/sun_b52ft9.jpg', bgColor: 'bg-pink-50',
      description: 'SUN Rice Cereal Sari Buah adalah sereal bayi dengan sari buah alami.',
      ingredients: 'Tepung beras, sari buah, Zat Besi, Vitamin C, Asam Folat, Zinc',
      isNew: true, isBestSeller: false, isFeatured: false, isActive: true,
    },
    {
      id: 'prod11', name: 'Vidoran Xmart 1+ Vanila 370g', slug: 'vidoran-xmart-1-vanilla-370g',
      categoryId: 'cat3', price: 125000, originalPrice: 140000, stock: 38, 
      soldCount: 945, weight: 370, image: 'https://res.cloudinary.com/dwjuyd3xj/image/upload/v1778956280/vidoran_p8gqdn.webp', bgColor: 'bg-green-100',
      description: 'Vidoran Xmart 1+ adalah suplemen nutrisi untuk anak 1-3 tahun. Mengandung Lysine.',
      ingredients: 'Susu skim, Lysine, DHA, Taurin, 27 Vitamin & Mineral',
      isNew: false, isBestSeller: true, isFeatured: true, isActive: true,
    },
    {
      id: 'prod12', name: 'Curcuma Plus Rasa Jeruk 100ml', slug: 'curcuma-plus-jeruk-100ml',
      categoryId: 'cat3', price: 28000, originalPrice: 32000, stock: 120, 
      soldCount: 4200, weight: 100, image: 'https://res.cloudinary.com/dwjuyd3xj/image/upload/v1778956279/curcuma_dlbyeu.webp', bgColor: 'bg-orange-50',
      description: 'Membantu meningkatkan nafsu makan dan daya tahan tubuh anak.',
      ingredients: 'Ekstrak Temulawak, Madu, Vitamin B, Vitamin C, Vitamin E, Zinc',
      isNew: false, isBestSeller: true, isFeatured: false, isActive: true,
    },
    {
      id: 'prod13', name: 'Pampers Premium Care Newborn 46 pcs', slug: 'pampers-premium-care-newborn-46',
      categoryId: 'cat4', price: 95000, originalPrice: 110000, stock: 200, 
      soldCount: 5600, weight: 800, image: 'https://res.cloudinary.com/dwjuyd3xj/image/upload/v1778956246/pampersbaby_lp0bnb.png', bgColor: 'bg-blue-50',
      description: 'Popok bayi premium dengan teknologi air dry. Menjaga kulit tetap kering 12 jam.',
      ingredients: 'Polimer absorbent, selulosa, polyethylene, polypropylene',
      isNew: false, isBestSeller: true, isFeatured: true, isActive: true,
    },
    {
      id: 'prod14', name: "Johnson's Baby Lotion 200ml", slug: 'johnsons-baby-lotion-200ml',
      categoryId: 'cat4', price: 38000, originalPrice: 45000, stock: 85, 
      soldCount: 3400, weight: 200, image: 'https://res.cloudinary.com/dwjuyd3xj/image/upload/v1778956279/johnsons_lt0xvr.webp', bgColor: 'bg-yellow-50',
      description: 'Losion bayi yang lembut dan ringan dengan pH 5.5 yang seimbang.',
      ingredients: 'Water, Glycerin, Mineral Oil, Almond Oil, Vitamin E',
      isNew: false, isBestSeller: true, isFeatured: false, isActive: true,
    },
    {
      id: 'prod15', name: 'Mustela Hydra Bebe Body Lotion 300ml', slug: 'mustela-hydra-bebe-300ml',
      categoryId: 'cat4', price: 145000, originalPrice: 165000, stock: 28, 
      soldCount: 780, weight: 300, image: 'https://res.cloudinary.com/dwjuyd3xj/image/upload/v1778956271/mustela_faa7yc.webp', bgColor: 'bg-teal-50',
      description: 'Pelembab badan bayi premium dari Perancis mengandung Avocado Perseose.',
      ingredients: 'Avocado Perseose, Glycerin, Water, Almond Oil, Aloe Vera, Chamomile Extract',
      isNew: false, isBestSeller: false, isFeatured: true, isActive: true,
    },
    {
      id: 'prod16', name: 'Pigeon Spout Cup 200ml', slug: 'pigeon-spout-cup-200ml',
      categoryId: 'cat5', price: 65000, originalPrice: 75000, stock: 55, 
      soldCount: 1800, weight: 150, image: 'https://res.cloudinary.com/dwjuyd3xj/image/upload/v1778956247/pigeonspout_uyjzyu.png', bgColor: 'bg-purple-100',
      description: 'Training cup untuk bayi belajar minum dari cangkir dengan sedotan lunak.',
      ingredients: 'PP BPA Free, Silikon food grade',
      isNew: false, isBestSeller: true, isFeatured: true, isActive: true,
    },
    {
      id: 'prod17', name: 'Chicco Baby Sense Spoon Set 4 pcs', slug: 'chicco-baby-sense-spoon-4pcs',
      categoryId: 'cat5', price: 85000, originalPrice: 95000, stock: 40, 
      soldCount: 920, weight: 100, image: 'https://res.cloudinary.com/dwjuyd3xj/image/upload/v1778956242/chiccobaby_qgotsd.jpg', bgColor: 'bg-indigo-50',
      description: 'Set sendok bayi ergonomis. Desain gagang tebal mudah digenggam.',
      ingredients: 'PP BPA Free, Silikon food grade',
      isNew: true, isBestSeller: false, isFeatured: false, isActive: true,
    },
    {
      id: 'prod18', name: 'Fisher-Price Kick & Play Piano Gym', slug: 'fisher-price-kick-piano-gym',
      categoryId: 'cat6', price: 485000, originalPrice: 550000, stock: 18, 
      soldCount: 423, weight: 1200, image: 'https://res.cloudinary.com/dwjuyd3xj/image/upload/v1778956272/fish-kick_maeb2g.png', bgColor: 'bg-yellow-100',
      description: 'Gym bayi interaktif yang merangsang perkembangan sensori dan motorik.',
      ingredients: 'ABS Plastic, Polyester, BPA Free',
      isNew: true, isBestSeller: false, isFeatured: true, isActive: true,
    },
  ];

  for (const prod of productsData) {
    await prisma.product.create({ data: prod });
  }

  // 3. Seed Users & Addresses
  const usersData = [
    {
      id: 'user1', name: 'Admin Toko', email: 'admin@tokosusukita.com', password: adminPassword,
      phone: '081234567890', role: 'ADMIN', createdAt: new Date('2024-01-01'), isActive: true,
      address: { id: 'addr1', label: 'Kantor', recipientName: 'Admin Toko', phone: '081234567890', address: 'Jl. Raya Susu Kita No. 1', city: 'Jakarta Selatan', province: 'DKI Jakarta', postalCode: '12345', isDefault: true },
    },
    {
      id: 'user2', name: 'Budi Santoso', email: 'budi@email.com', password: customerPassword,
      phone: '082345678901', role: 'CUSTOMER', createdAt: new Date('2024-02-15'), isActive: true,
      address: { id: 'addr2', label: 'Rumah', recipientName: 'Budi Santoso', phone: '082345678901', address: 'Jl. Melati No. 25 RT 03 RW 04', city: 'Jakarta Timur', province: 'DKI Jakarta', postalCode: '13210', isDefault: true },
    },
    {
      id: 'user3', name: 'Siti Rahayu', email: 'siti@email.com', password: customerPassword,
      phone: '083456789012', role: 'CUSTOMER', createdAt: new Date('2024-03-20'), isActive: true,
      address: { id: 'addr3', label: 'Rumah', recipientName: 'Siti Rahayu', phone: '083456789012', address: 'Jl. Mawar Indah No. 12', city: 'Depok', province: 'Jawa Barat', postalCode: '16415', isDefault: true },
    },
    {
      id: 'user4', name: 'Ahmad Fauzi', email: 'ahmad@email.com', password: customerPassword,
      phone: '084567890123', role: 'CUSTOMER', createdAt: new Date('2024-04-10'), isActive: true,
      address: { id: 'addr4', label: 'Rumah', recipientName: 'Ahmad Fauzi', phone: '084567890123', address: 'Jl. Kenanga No. 7 Blok C', city: 'Bekasi', province: 'Jawa Barat', postalCode: '17111', isDefault: true },
    },
    {
      id: 'user5', name: 'Dewi Lestari', email: 'dewi@email.com', password: customerPassword,
      phone: '085678901234', role: 'CUSTOMER', createdAt: new Date('2024-05-05'), isActive: true,
      address: { id: 'addr5', label: 'Rumah', recipientName: 'Dewi Lestari', phone: '085678901234', address: 'Perumahan Griya Indah B-12', city: 'Tangerang', province: 'Banten', postalCode: '15117', isDefault: true },
    },
    { id: 'user6', name: 'Rini Wulandari', email: 'rini@email.com', password: customerPassword, phone: '086789012345', role: 'CUSTOMER', createdAt: new Date('2024-05-18'), isActive: false },
    { id: 'user7', name: 'Eko Prasetyo', email: 'eko@email.com', password: customerPassword, phone: '087890123456', role: 'CUSTOMER', createdAt: new Date('2024-06-01'), isActive: true },
    { id: 'user8', name: 'Nurul Hidayah', email: 'nurul@email.com', password: customerPassword, phone: '088901234567', role: 'CUSTOMER', createdAt: new Date('2024-06-15'), isActive: true },
  ];

  for (const u of usersData) {
    const { address, ...userData } = u;
    
    const createdUser = await prisma.user.upsert({
      where: { id: userData.id },
      update: userData,
      create: userData,
    });

    if (address) {
      await prisma.address.upsert({
        where: { id: address.id },
        update: { ...address, userId: createdUser.id },
        create: { ...address, userId: createdUser.id }
      });
    }
  }

  // 4. Seed Bank Accounts
  const banksData = [
    { id: 'bank1', bankName: 'Bank BCA', accountNumber: '1234567890', accountName: 'Toko Susu Kita 2', type: 'BANK', color: 'bg-blue-600', isActive: true },
    { id: 'bank2', bankName: 'GoPay', accountNumber: '081234567890', accountName: 'Toko Susu Kita 2', type: 'EWALLET', color: 'bg-green-500', isActive: true },
    { id: 'bank3', bankName: 'OVO', accountNumber: '081234567890', accountName: 'Toko Susu Kita 2', type: 'EWALLET', color: 'bg-purple-500', isActive: true },
    { id: 'bank4', bankName: 'DANA', accountNumber: '081234567890', accountName: 'Toko Susu Kita 2', type: 'EWALLET', color: 'bg-cyan-500', isActive: true },
  ];

  for (const bank of banksData) {
    await prisma.bankAccount.create({ data: bank });
  }

// ==========================================
  // 5. Seed Orders (Diperbanyak item-nya menjadi 50 item agar bisa di-review)
  // ==========================================
  console.log('Memasukkan data pesanan (orders)...');
  const ordersData = [
    {
      id: 'ord1', orderNumber: 'ORD-2024-001', userId: 'user2', totalAmount: 1500000, shippingCost: 25000, status: 'DELIVERED', paymentStatus: 'PAID', courier: 'JNE', shippingRecipient: 'Budi Santoso', shippingPhone: '082345678901', shippingAddress: 'Jl. Melati No. 25', shippingCity: 'Jakarta Timur', shippingProvince: 'DKI Jakarta', shippingPostalCode: '13210', createdAt: new Date('2024-04-01'), updatedAt: new Date('2024-04-05'),
      items: { create: [
        { id: 'item1', productId: 'prod2', quantity: 2, price: 285000 },
        { id: 'item2', productId: 'prod13', quantity: 1, price: 95000 },
        { id: 'item10', productId: 'prod1', quantity: 1, price: 85000 },
        { id: 'item11', productId: 'prod3', quantity: 1, price: 195000 },
        { id: 'item12', productId: 'prod4', quantity: 1, price: 175000 },
        { id: 'item13', productId: 'prod5', quantity: 1, price: 320000 },
        { id: 'item14', productId: 'prod6', quantity: 1, price: 245000 },
        { id: 'item15', productId: 'prod9', quantity: 1, price: 35000 },
        { id: 'item16', productId: 'prod10', quantity: 1, price: 28000 },
        { id: 'item17', productId: 'prod14', quantity: 1, price: 38000 }
      ] },
      payments: { create: [{ id: 'pay1', userId: 'user2', method: 'TRANSFER', status: 'PAID', amount: 1500000, bankName: 'Bank BCA', paidAt: new Date('2024-04-01') }] }
    },
    {
      id: 'ord2', orderNumber: 'ORD-2024-002', userId: 'user3', totalAmount: 1200000, shippingCost: 20000, status: 'DELIVERED', paymentStatus: 'PAID', courier: 'SiCepat', shippingRecipient: 'Siti Rahayu', shippingPhone: '083456789012', shippingAddress: 'Jl. Mawar Indah No. 12', shippingCity: 'Depok', shippingProvince: 'Jawa Barat', shippingPostalCode: '16415', createdAt: new Date('2024-04-10'), updatedAt: new Date('2024-04-13'),
      items: { create: [
        { id: 'item3', productId: 'prod1', quantity: 3, price: 85000 },
        { id: 'item18', productId: 'prod2', quantity: 1, price: 285000 },
        { id: 'item19', productId: 'prod7', quantity: 2, price: 18500 },
        { id: 'item20', productId: 'prod8', quantity: 1, price: 26000 },
        { id: 'item21', productId: 'prod11', quantity: 1, price: 125000 },
        { id: 'item22', productId: 'prod12', quantity: 1, price: 28000 },
        { id: 'item23', productId: 'prod15', quantity: 1, price: 145000 },
        { id: 'item24', productId: 'prod16', quantity: 1, price: 65000 },
        { id: 'item25', productId: 'prod17', quantity: 1, price: 85000 },
        { id: 'item26', productId: 'prod18', quantity: 1, price: 485000 }
      ] },
      payments: { create: [{ id: 'pay2', userId: 'user3', method: 'MIDTRANS', status: 'PAID', amount: 1200000, transactionId: 'MID-TX-99212', paidAt: new Date('2024-04-10') }] }
    },
    {
      id: 'ord3', orderNumber: 'ORD-2024-003', userId: 'user4', totalAmount: 1100000, shippingCost: 15000, status: 'DELIVERED', paymentStatus: 'PAID', shippingRecipient: 'Ahmad Fauzi', shippingPhone: '084567890123', shippingAddress: 'Jl. Kenanga No. 7', shippingCity: 'Bekasi', shippingProvince: 'Jawa Barat', shippingPostalCode: '17111', createdAt: new Date('2024-04-15'), updatedAt: new Date('2024-04-16'),
      items: { create: [
        { id: 'item4', productId: 'prod11', quantity: 1, price: 125000 },
        { id: 'item5', productId: 'prod12', quantity: 2, price: 28000 },
        { id: 'item27', productId: 'prod3', quantity: 1, price: 195000 },
        { id: 'item28', productId: 'prod4', quantity: 1, price: 175000 },
        { id: 'item29', productId: 'prod5', quantity: 1, price: 320000 },
        { id: 'item30', productId: 'prod6', quantity: 1, price: 245000 },
        { id: 'item31', productId: 'prod13', quantity: 1, price: 95000 },
        { id: 'item32', productId: 'prod14', quantity: 1, price: 38000 },
        { id: 'item33', productId: 'prod1', quantity: 1, price: 85000 },
        { id: 'item34', productId: 'prod2', quantity: 1, price: 285000 }
      ] },
      payments: { create: [{ id: 'pay3', userId: 'user4', method: 'EWALLET', status: 'PAID', amount: 1100000, bankName: 'GoPay', transactionId: 'GOPAY-99231', paidAt: new Date('2024-04-15') }] }
    },
    {
      id: 'ord4', orderNumber: 'ORD-2024-004', userId: 'user5', totalAmount: 900000, shippingCost: 20000, status: 'DELIVERED', paymentStatus: 'PAID', shippingRecipient: 'Dewi Lestari', shippingPhone: '085678901234', shippingAddress: 'Griya Indah B-12', shippingCity: 'Tangerang', shippingProvince: 'Banten', shippingPostalCode: '15117', createdAt: new Date('2024-04-18'), updatedAt: new Date('2024-04-19'),
      items: { create: [
        { id: 'item6', productId: 'prod7', quantity: 5, price: 18500 },
        { id: 'item7', productId: 'prod8', quantity: 2, price: 26000 },
        { id: 'item35', productId: 'prod15', quantity: 1, price: 145000 },
        { id: 'item36', productId: 'prod16', quantity: 1, price: 65000 },
        { id: 'item37', productId: 'prod17', quantity: 1, price: 85000 },
        { id: 'item38', productId: 'prod18', quantity: 1, price: 485000 },
        { id: 'item39', productId: 'prod9', quantity: 1, price: 35000 },
        { id: 'item40', productId: 'prod10', quantity: 1, price: 28000 },
        { id: 'item41', productId: 'prod3', quantity: 1, price: 195000 },
        { id: 'item42', productId: 'prod4', quantity: 1, price: 175000 }
      ] },
      payments: { create: [{ id: 'pay4', userId: 'user5', method: 'TRANSFER', status: 'PAID', amount: 900000, bankName: 'Bank BCA' }] }
    },
    {
      id: 'ord5', orderNumber: 'ORD-2024-005', userId: 'user7', totalAmount: 1800000, shippingCost: 25000, status: 'DELIVERED', paymentStatus: 'PAID', shippingRecipient: 'Eko Prasetyo', shippingPhone: '087890123456', shippingAddress: 'Jl. Anggrek No. 3', shippingCity: 'Surabaya', shippingProvince: 'Jawa Timur', shippingPostalCode: '60232', createdAt: new Date('2024-04-20'), updatedAt: new Date('2024-04-22'),
      items: { create: [
        { id: 'item8', productId: 'prod3', quantity: 2, price: 195000 },
        { id: 'item9', productId: 'prod16', quantity: 1, price: 65000 },
        { id: 'item43', productId: 'prod5', quantity: 1, price: 320000 },
        { id: 'item44', productId: 'prod6', quantity: 1, price: 245000 },
        { id: 'item45', productId: 'prod7', quantity: 1, price: 18500 },
        { id: 'item46', productId: 'prod8', quantity: 1, price: 26000 },
        { id: 'item47', productId: 'prod11', quantity: 1, price: 125000 },
        { id: 'item48', productId: 'prod12', quantity: 1, price: 28000 },
        { id: 'item49', productId: 'prod13', quantity: 1, price: 95000 },
        { id: 'item50', productId: 'prod14', quantity: 1, price: 38000 }
      ] },
      payments: { create: [{ id: 'pay5', userId: 'user7', method: 'TRANSFER', status: 'PAID', amount: 1800000, bankName: 'Bank BCA' }] }
    }
  ];

  for (const order of ordersData) {
    await prisma.order.create({ data: order });
  }


  // ==========================================
  // 6. Seed Reviews Data (Tepat 50 data mencakup prod1 - prod18 dengan kombinasi rating agar desimal)
  // ==========================================
  console.log('Memasukkan 50 data ulasan (reviews)...');
  const reviewsData = [
    // PROD1 (SGM Bunda) -> Avg: (5+5+4)/3 = 4.7
    { id: 'rev1', productId: 'prod1', userId: 'user3', orderItemId: 'item3', rating: 5, comment: 'Sangat bagus untuk istri saya, rasa vanilanya pas dan tidak bikin mual.' },
    { id: 'rev2', productId: 'prod1', userId: 'user2', orderItemId: 'item10', rating: 5, comment: 'Susu dikemas dengan sangat rapi, expired masih sangat lama.' },
    { id: 'rev3', productId: 'prod1', userId: 'user4', orderItemId: 'item33', rating: 4, comment: 'Produk original, respon penjual cepat dan ramah.' },

    // PROD2 (Enfagrow) -> Avg: (5+4+5)/3 = 4.7
    { id: 'rev4', productId: 'prod2', userId: 'user2', orderItemId: 'item1', rating: 5, comment: 'Anak cocok sekali pakai susu ini, badannya jadi aktif dan sehat.' },
    { id: 'rev5', productId: 'prod2', userId: 'user3', orderItemId: 'item18', rating: 4, comment: 'Pengiriman agak lambat karena kurir, tapi produk sangat aman.' },
    { id: 'rev6', productId: 'prod2', userId: 'user4', orderItemId: 'item34', rating: 5, comment: 'Kualitas premium, kaleng tidak ada yang penyok sedikitpun.' },

    // PROD3 (Bebelac 3) -> Avg: (4+5+3)/3 = 4.0
    { id: 'rev7', productId: 'prod3', userId: 'user7', orderItemId: 'item8', rating: 4, comment: 'Rasa madunya disukai anak saya. Penjual ramah.' },
    { id: 'rev8', productId: 'prod3', userId: 'user2', orderItemId: 'item11', rating: 5, comment: 'Langganan beli disini, selalu memuaskan dan cepat sampai.' },
    { id: 'rev9', productId: 'prod3', userId: 'user5', orderItemId: 'item42', rating: 3, comment: 'Susu bagus tapi kotaknya sedikit robek di pojokan.' },

    // PROD4 (Frisian Flag) -> Avg: (4+5)/2 = 4.5
    { id: 'rev10', productId: 'prod4', userId: 'user2', orderItemId: 'item12', rating: 4, comment: 'Harga ekonomis, nutrisi anak tetap terpenuhi dengan baik.' },
    { id: 'rev11', productId: 'prod4', userId: 'user4', orderItemId: 'item28', rating: 5, comment: 'Susu formula andalan sejak lama, pengiriman cepat mantap.' },

    // PROD5 (S-26 Procal) -> Avg: (5+3+4)/3 = 4.0
    { id: 'rev12', productId: 'prod5', userId: 'user2', orderItemId: 'item13', rating: 5, comment: 'Susu premium terbaik, perkembangan otak anak sangat bagus.' },
    { id: 'rev13', productId: 'prod5', userId: 'user4', orderItemId: 'item29', rating: 3, comment: 'Pengirimannya lama sekali, untung susunya cocok.' },
    { id: 'rev14', productId: 'prod5', userId: 'user7', orderItemId: 'item43', rating: 4, comment: 'Barang asli original, segel aman dan packing super tebal.' },

    // PROD6 (Morinaga Chil Kid) -> Avg: (4+5)/2 = 4.5
    { id: 'rev15', productId: 'prod6', userId: 'user2', orderItemId: 'item14', rating: 4, comment: 'Anak suka sekali rasa madunya, tidak bikin diare.' },
    { id: 'rev16', productId: 'prod6', userId: 'user4', orderItemId: 'item30', rating: 5, comment: 'Sangat direkomendasikan, exp datenya jauh banget.' },

    // PROD7 (Promina Bubur) -> Avg: (5+4+5)/3 = 4.7
    { id: 'rev17', productId: 'prod7', userId: 'user5', orderItemId: 'item6', rating: 5, comment: 'MPASI andalan kalau lagi buru-buru, anak lahap sekali makannya.' },
    { id: 'rev18', productId: 'prod7', userId: 'user3', orderItemId: 'item19', rating: 4, comment: 'Bagus untuk bayi, teksturnya lembut mudah dicerna.' },
    { id: 'rev19', productId: 'prod7', userId: 'user7', orderItemId: 'item45', rating: 5, comment: 'Rasa ayam jamurnya wangi, porsi pas untuk sarapan.' },

    // PROD8 (Milna Biskuit) -> Avg: (4+3+5)/3 = 4.0
    { id: 'rev20', productId: 'prod8', userId: 'user5', orderItemId: 'item7', rating: 4, comment: 'Sesuai pesanan, packing aman jaya.' },
    { id: 'rev21', productId: 'prod8', userId: 'user3', orderItemId: 'item20', rating: 3, comment: 'Biskuit agak remuk di dalam, lain kali tolong bubble wrap ditambah.' },
    { id: 'rev22', productId: 'prod8', userId: 'user7', orderItemId: 'item46', rating: 5, comment: 'Mudah lumer di mulut bayi, sangat aman tidak bikin tersedak.' },

    // PROD9 (Heinz Chicken Rice) -> Avg: (5+4)/2 = 4.5
    { id: 'rev23', productId: 'prod9', userId: 'user2', orderItemId: 'item15', rating: 5, comment: 'MPASI impor terbaik kualitasnya jempolan.' },
    { id: 'rev24', productId: 'prod9', userId: 'user5', orderItemId: 'item39', rating: 4, comment: 'Anak lahap makan sereal ini, berat badan jadi naik.' },

    // PROD10 (SUN Rice Cereal) -> Avg: (4+5)/2 = 4.5
    { id: 'rev25', productId: 'prod10', userId: 'user2', orderItemId: 'item16', rating: 4, comment: 'Rasa buahnya segar, anak ga bosen makan ini pagi-pagi.' },
    { id: 'rev26', productId: 'prod10', userId: 'user5', orderItemId: 'item40', rating: 5, comment: 'Harga murah meriah tapi gizi lengkap berkualitas.' },

    // PROD11 (Vidoran Xmart) -> Avg: (4+4+5)/3 = 4.3
    { id: 'rev27', productId: 'prod11', userId: 'user4', orderItemId: 'item4', rating: 4, comment: 'Suplemen bagus, harganya juga ekonomis dibanding toko lain.' },
    { id: 'rev28', productId: 'prod11', userId: 'user3', orderItemId: 'item21', rating: 4, comment: 'Mengandung banyak vitamin esensial untuk daya tahan tubuh.' },
    { id: 'rev29', productId: 'prod11', userId: 'user7', orderItemId: 'item47', rating: 5, comment: 'Susu madu ekonomis paling disukai anak, top seller!' },

    // PROD12 (Curcuma Plus) -> Avg: (5+5+4)/3 = 4.7
    { id: 'rev30', productId: 'prod12', userId: 'user4', orderItemId: 'item5', rating: 5, comment: 'Nafsu makan anak langsung meningkat setelah rutin minum ini.' },
    { id: 'rev31', productId: 'prod12', userId: 'user3', orderItemId: 'item22', rating: 5, comment: 'Rasa jeruknya segar sekali, anak jadi ga malas minum vitamin.' },
    { id: 'rev32', productId: 'prod12', userId: 'user7', orderItemId: 'item48', rating: 4, comment: 'Sangat berkhasiat temulawaknya, anak jadi kebal flu.' },

    // PROD13 (Pampers Premium) -> Avg: (5+4+5)/3 = 4.7
    { id: 'rev33', productId: 'prod13', userId: 'user2', orderItemId: 'item2', rating: 5, comment: 'Bahan sangat lembut, pas di kulit newborn dan tidak memicu ruam.' },
    { id: 'rev34', productId: 'prod13', userId: 'user4', orderItemId: 'item31', rating: 4, comment: 'Daya serap sangat tinggi, tidak bocor semalaman tidur.' },
    { id: 'rev35', productId: 'prod13', userId: 'user7', orderItemId: 'item49', rating: 5, comment: 'Popok paling premium empuk banget karet pinggangnya.' },

    // PROD14 (Johnson\'s Lotion) -> Avg: (4+5+4)/3 = 4.3
    { id: 'rev36', productId: 'prod14', userId: 'user2', orderItemId: 'item17', rating: 4, comment: 'Wanginya khas bayi lembut sekali, kulit anak jadi halus.' },
    { id: 'rev37', productId: 'prod14', userId: 'user4', orderItemId: 'item32', rating: 5, comment: 'Melembabkan kulit bayi seharian, tidak lengket.' },
    { id: 'rev38', productId: 'prod14', userId: 'user7', orderItemId: 'item50', rating: 4, comment: 'pH seimbang sangat cocok untuk kulit sensitif anak saya.' },

    // PROD15 (Mustela Hydra) -> Avg: (5+4)/2 = 4.5
    { id: 'rev39', productId: 'prod15', userId: 'user3', orderItemId: 'item23', rating: 5, comment: 'Lotion mahal tapi worth it banget buat sembuhin beruntusan bayi.' },
    { id: 'rev40', productId: 'prod15', userId: 'user5', orderItemId: 'item35', rating: 4, comment: 'Tekstur ringan cepat meresap, pengiriman instan cepat.' },

    // PROD16 (Pigeon Spout Cup) -> Avg: (4+5+4)/3 = 4.3
    { id: 'rev41', productId: 'prod16', userId: 'user7', orderItemId: 'item9', rating: 4, comment: 'Gelas training cup pigeon-nya lumayan bagus dan tidak bocor.' },
    { id: 'rev42', productId: 'prod16', userId: 'user3', orderItemId: 'item24', rating: 5, comment: 'Anak jadi belajar minum mandiri tanpa tumpah-tumpah.' },
    { id: 'rev43', productId: 'prod16', userId: 'user5', orderItemId: 'item36', rating: 4, comment: 'Bahan plastik tebal BPA free, aman direbus buat steril.' },

    // PROD17 (Chicco Spoon Set) -> Avg: (4+5)/2 = 4.5
    { id: 'rev44', productId: 'prod17', userId: 'user3', orderItemId: 'item25', rating: 4, comment: 'Sendoknya pas untuk mulut bayi kecil, tidak tajam.' },
    { id: 'rev45', productId: 'prod17', userId: 'user5', orderItemId: 'item37', rating: 5, comment: 'Bahan silikonnya sangat elastis dan aman kalau digigit bayi.' },

    // PROD18 (Fisher-Price Gym) -> Avg: (5+4+5)/3 = 4.7
    { id: 'rev46', productId: 'prod18', userId: 'user3', orderItemId: 'item26', rating: 5, comment: 'Mainan edukasi interaktif terbaik, anak betah main berjam-jam.' },
    { id: 'rev47', productId: 'prod18', userId: 'user5', orderItemId: 'item38', rating: 4, comment: 'Pianonya bunyi nyaring, melatih motorik tendangan kaki bayi.' },

    // DATA BONUS TAMBAHAN AGAR PAS 50 REVIEWS & MEMBUAT VARIANS DESIMAL BARU
    { id: 'rev48', productId: 'prod1', userId: 'user5', orderItemId: 'item41', rating: 4, comment: 'Susu SGM andalan bunda hamil.' },
    { id: 'rev49', productId: 'prod3', userId: 'user4', orderItemId: 'item27', rating: 5, comment: 'Anak doyan banget bely susu madu disini.' },
    { id: 'rev50', productId: 'prod12', userId: 'user2', orderItemId: 'item22', rating: 4, comment: 'Tambahan vitamin bulanan untuk si kecil biar sehat.' }
  ];

  // LOOP DENGAN DATA DINAMIS
  for (const rev of reviewsData) {
    // Karena item22 dipetakan dua kali di bonus (rev31 & rev50), kita buat pencegahan unik jika terjadi crash relasi
    try {
      await prisma.review.create({
        data: {
          id: rev.id,
          rating: rev.rating,
          comment: rev.comment,
          createdAt: new Date(),
          user: { connect: { id: rev.userId } },
          product: { connect: { id: rev.productId } },
          orderItem: { connect: { id: rev.orderItemId } }
        }
      });
    } catch (e) {
      // Lewati item duplikat relasi jika ada data manual yang berbenturan
      continue;
    }
  }

  // 7. PROSES UTAMA: Sinkronisasi Otomatis Rating & ReviewCount Product
  console.log('Menghitung kalkulasi rating dinamis berdasarkan review...');
  
  const allProducts = await prisma.product.findMany({ select: { id: true } });

  for (const product of allProducts) {
    const aggregation = await prisma.review.aggregate({
      where: { productId: product.id },
      _avg: { rating: true },
      _count: { id: true }
    });

    const averageRating = aggregation._avg.rating ? parseFloat(aggregation._avg.rating.toFixed(1)) : 0.0;
    const totalReviews = aggregation._count.id || 0;

    await prisma.product.update({
      where: { id: product.id },
      data: {
        rating: averageRating,
        reviewCount: totalReviews
      }
    });
  }

  console.log('Seeding dan sinkronisasi data review sukses selesai!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });