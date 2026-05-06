const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Sedang membersihkan database...');
  // Hapus urutan terbalik untuk menghindari error foreign key
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  console.log('Memulai proses seeding...');

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
      stock: 50, rating: 4.8, reviewCount: 234, soldCount: 1250, weight: 400,
      image: '/images/sgm-bunda-vanilla-400g.jpg', bgColor: 'bg-blue-100',
      description: 'SGM Bunda adalah susu khusus untuk ibu hamil dan menyusui...',
      ingredients: 'Susu skim, gula, minyak nabati, DHA, AA...',
      isNew: false, isBestSeller: true, isFeatured: true, isActive: true,
    },
    {
      id: 'prod2', name: 'Enfagrow A+ Three 1-3 Tahun 800g', slug: 'enfagrow-a-plus-three-800g',
      categoryId: 'cat1', price: 285000, originalPrice: 320000,
      stock: 35, rating: 4.9, reviewCount: 412, soldCount: 2100, weight: 800,
      image: '/images/enfagrow-a-plus-three-800g.jpg', bgColor: 'bg-sky-100',
      description: 'Enfagrow A+ Three adalah susu pertumbuhan untuk anak usia 1-3 tahun...',
      ingredients: 'Skim milk, vegetable oil, lactose, MFGM, DHA, AA...',
      isNew: false, isBestSeller: true, isFeatured: true, isActive: true,
    },
   {
      id: 'prod3', name: 'Bebelac 3 Susu Pertumbuhan Madu 900g', slug: 'bebelac-3-madu-900g',
      categoryId: 'cat1', price: 195000, originalPrice: 220000, stock: 42, rating: 4.7, 
      reviewCount: 315, soldCount: 1650, weight: 900, image: '/images/bebelac-3-madu-900g.jpg', bgColor: 'bg-amber-100',
      description: 'Bebelac 3 hadir dengan rasa madu yang disukai anak. Mengandung Prebiotik GOS yang mendukung sistem imun.',
      ingredients: 'Susu skim, laktosa, minyak nabati, GOS, Vitamin D, Kalsium, Zat Besi',
      isNew: false, isBestSeller: true, isFeatured: false, isActive: true,
    },
    {
      id: 'prod4', name: 'Frisian Flag 123 Jelajah Madu 900g', slug: 'frisian-flag-123-madu-900g',
      categoryId: 'cat1', price: 175000, originalPrice: 195000, stock: 60, rating: 4.6, 
      reviewCount: 287, soldCount: 1420, weight: 900, image: '/images/frisian-flag-123-madu-900g.jpg', bgColor: 'bg-blue-100',
      description: 'Frisian Flag 123 Jelajah adalah susu pertumbuhan lengkap untuk anak 1-3 tahun. Mengandung Trigold.',
      ingredients: 'Susu skim, laktosa, DHA, Lutein, Kolin, Vitamin D, Kalsium',
      isNew: false, isBestSeller: false, isFeatured: true, isActive: true,
    },
    {
      id: 'prod5', name: 'S-26 Procal Gold Susu Formula 900g', slug: 's26-procal-gold-900g',
      categoryId: 'cat1', price: 320000, originalPrice: 350000, stock: 25, rating: 4.8, 
      reviewCount: 198, soldCount: 890, weight: 900, image: '/images/s26-procal-gold-900g.jpg', bgColor: 'bg-yellow-100',
      description: 'S-26 Procal Gold adalah susu formula premium untuk anak 3-12 tahun. Mengandung Procalbiotic.',
      ingredients: 'Susu skim, whey protein, DHA, Procalbiotic, Kalsium, Fosfor',
      isNew: true, isBestSeller: false, isFeatured: true, isActive: true,
    },
    {
      id: 'prod6', name: 'Morinaga Chil Kid Rasa Madu 800g', slug: 'morinaga-chil-kid-madu-800g',
      categoryId: 'cat1', price: 245000, originalPrice: 270000, stock: 30, rating: 4.7, 
      reviewCount: 156, soldCount: 780, weight: 800, image: '/images/morinaga-chil-kid-madu-800g.jpg', bgColor: 'bg-amber-50',
      description: 'Morinaga Chil Kid mengandung BifidusBB12 yang terbukti klinis mendukung sistem imun.',
      ingredients: 'Susu skim, BifidusBB12, DHA, Kolin, Vitamin A, C, D, E',
      isNew: false, isBestSeller: false, isFeatured: false, isActive: true,
    },
    {
      id: 'prod7', name: 'Promina Bubur Bayi Tim Ayam 120g', slug: 'promina-bubur-ayam-120g',
      categoryId: 'cat2', price: 18500, originalPrice: 22000, stock: 100, rating: 4.5, 
      reviewCount: 423, soldCount: 3200, weight: 120, image: '/images/promina-bubur-ayam-120g.jpg', bgColor: 'bg-orange-100',
      description: 'Promina Bubur Bayi Tim Ayam adalah makanan bayi siap saji untuk usia 8+ bulan.',
      ingredients: 'Tepung beras, ayam, wortel, bayam, susu skim, minyak nabati',
      isNew: false, isBestSeller: true, isFeatured: true, isActive: true,
    },
    {
      id: 'prod8', name: 'Milna Biskuit Bayi Original 6+ Bulan 130g', slug: 'milna-biskuit-bayi-130g',
      categoryId: 'cat2', price: 26000, originalPrice: 30000, stock: 80, rating: 4.6, 
      reviewCount: 312, soldCount: 2400, weight: 130, image: '/images/milna-biskuit-bayi-130g.jpg', bgColor: 'bg-yellow-50',
      description: 'Milna Biskuit Bayi adalah snack sehat untuk bayi usia 6+ bulan. Teksturnya mudah larut.',
      ingredients: 'Tepung gandum, susu, gula, DHA, Vitamin B kompleks, Kalsium',
      isNew: false, isBestSeller: true, isFeatured: false, isActive: true,
    },
    {
      id: 'prod9', name: 'Heinz Chicken Rice Cereal 125g', slug: 'heinz-chicken-rice-cereal-125g',
      categoryId: 'cat2', price: 35000, originalPrice: 42000, stock: 45, rating: 4.4, 
      reviewCount: 187, soldCount: 1100, weight: 125, image: '/images/heinz-chicken-rice-cereal-125g.jpg', bgColor: 'bg-red-50',
      description: 'Heinz Chicken Rice Cereal adalah MPASI impor berkualitas untuk bayi 6+ bulan.',
      ingredients: 'Tepung beras, ayam asli, Vitamin C, Zat Besi, Kalsium',
      isNew: false, isBestSeller: false, isFeatured: true, isActive: true,
    },
    {
      id: 'prod10', name: 'SUN Rice Cereal Sari Buah 120g', slug: 'sun-rice-cereal-sari-buah-120g',
      categoryId: 'cat2', price: 28000, originalPrice: 32000, stock: 65, rating: 4.5, 
      reviewCount: 245, soldCount: 1560, weight: 120, image: '/images/sun-rice-cereal-sari-buah-120g.jpg', bgColor: 'bg-pink-50',
      description: 'SUN Rice Cereal Sari Buah adalah sereal bayi dengan sari buah alami.',
      ingredients: 'Tepung beras, sari buah, Zat Besi, Vitamin C, Asam Folat, Zinc',
      isNew: true, isBestSeller: false, isFeatured: false, isActive: true,
    },
    {
      id: 'prod11', name: 'Vidoran Xmart 1+ Vanila 370g', slug: 'vidoran-xmart-1-vanilla-370g',
      categoryId: 'cat3', price: 125000, originalPrice: 140000, stock: 38, rating: 4.7, 
      reviewCount: 198, soldCount: 945, weight: 370, image: '/images/vidoran-xmart-1-vanilla-370g.jpg', bgColor: 'bg-green-100',
      description: 'Vidoran Xmart 1+ adalah suplemen nutrisi untuk anak 1-3 tahun. Mengandung Lysine.',
      ingredients: 'Susu skim, Lysine, DHA, Taurin, 27 Vitamin & Mineral',
      isNew: false, isBestSeller: true, isFeatured: true, isActive: true,
    },
    {
      id: 'prod12', name: 'Curcuma Plus Rasa Jeruk 100ml', slug: 'curcuma-plus-jeruk-100ml',
      categoryId: 'cat3', price: 28000, originalPrice: 32000, stock: 120, rating: 4.6, 
      reviewCount: 567, soldCount: 4200, weight: 100, image: '/images/curcuma-plus-jeruk-100ml.jpg', bgColor: 'bg-orange-50',
      description: 'Membantu meningkatkan nafsu makan dan daya tahan tubuh anak.',
      ingredients: 'Ekstrak Temulawak, Madu, Vitamin B, Vitamin C, Vitamin E, Zinc',
      isNew: false, isBestSeller: true, isFeatured: false, isActive: true,
    },
    {
      id: 'prod13', name: 'Pampers Premium Care Newborn 46 pcs', slug: 'pampers-premium-care-newborn-46',
      categoryId: 'cat4', price: 95000, originalPrice: 110000, stock: 200, rating: 4.8, 
      reviewCount: 892, soldCount: 5600, weight: 800, image: '/images/pampers-premium-care-newborn-46.jpg', bgColor: 'bg-blue-50',
      description: 'Popok bayi premium dengan teknologi air dry. Menjaga kulit tetap kering 12 jam.',
      ingredients: 'Polimer absorbent, selulosa, polyethylene, polypropylene',
      isNew: false, isBestSeller: true, isFeatured: true, isActive: true,
    },
    {
      id: 'prod14', name: "Johnson's Baby Lotion 200ml", slug: 'johnsons-baby-lotion-200ml',
      categoryId: 'cat4', price: 38000, originalPrice: 45000, stock: 85, rating: 4.7, 
      reviewCount: 634, soldCount: 3400, weight: 200, image: '/images/johnsons-baby-lotion-200ml.jpg', bgColor: 'bg-yellow-50',
      description: 'Losion bayi yang lembut dan ringan dengan pH 5.5 yang seimbang.',
      ingredients: 'Water, Glycerin, Mineral Oil, Almond Oil, Vitamin E',
      isNew: false, isBestSeller: true, isFeatured: false, isActive: true,
    },
    {
      id: 'prod15', name: 'Mustela Hydra Bebe Body Lotion 300ml', slug: 'mustela-hydra-bebe-300ml',
      categoryId: 'cat4', price: 145000, originalPrice: 165000, stock: 28, rating: 4.9, 
      reviewCount: 234, soldCount: 780, weight: 300, image: '/images/mustela-hydra-bebe-300ml.jpg', bgColor: 'bg-teal-50',
      description: 'Pelembab badan bayi premium dari Perancis mengandung Avocado Perseose.',
      ingredients: 'Avocado Perseose, Glycerin, Water, Aloe Vera, Chamomile Extract',
      isNew: false, isBestSeller: false, isFeatured: true, isActive: true,
    },
    {
      id: 'prod16', name: 'Pigeon Spout Cup 200ml', slug: 'pigeon-spout-cup-200ml',
      categoryId: 'cat5', price: 65000, originalPrice: 75000, stock: 55, rating: 4.6, 
      reviewCount: 312, soldCount: 1800, weight: 150, image: '/images/pigeon-spout-cup-200ml.jpg', bgColor: 'bg-purple-100',
      description: 'Training cup untuk bayi belajar minum dari cangkir dengan sedotan lunak.',
      ingredients: 'PP BPA Free, Silikon food grade',
      isNew: false, isBestSeller: true, isFeatured: true, isActive: true,
    },
    {
      id: 'prod17', name: 'Chicco Baby Sense Spoon Set 4 pcs', slug: 'chicco-baby-sense-spoon-4pcs',
      categoryId: 'cat5', price: 85000, originalPrice: 95000, stock: 40, rating: 4.7, 
      reviewCount: 178, soldCount: 920, weight: 100, image: '/images/chicco-baby-sense-spoon-4pcs.jpg', bgColor: 'bg-indigo-50',
      description: 'Set sendok bayi ergonomis. Desain gagang tebal mudah digenggam.',
      ingredients: 'PP BPA Free, Silikon food grade',
      isNew: true, isBestSeller: false, isFeatured: false, isActive: true,
    },
    {
      id: 'prod18', name: 'Fisher-Price Kick & Play Piano Gym', slug: 'fisher-price-kick-piano-gym',
      categoryId: 'cat6', price: 485000, originalPrice: 550000, stock: 18, rating: 4.9, 
      reviewCount: 145, soldCount: 423, weight: 1200, image: '/images/fisher-price-kick-piano-gym.jpg', bgColor: 'bg-yellow-100',
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
      id: 'user1', name: 'Admin Toko', email: 'admin@tokosusukita.com', password: 'admin123',
      phone: '081234567890', role: 'ADMIN', createdAt: new Date('2024-01-01'), isActive: true,
      address: { id: 'addr1', label: 'Kantor', recipientName: 'Admin Toko', phone: '081234567890', address: 'Jl. Raya Susu Kita No. 1', city: 'Jakarta Selatan', province: 'DKI Jakarta', postalCode: '12345', isDefault: true },
    },
    {
      id: 'user2', name: 'Budi Santoso', email: 'budi@email.com', password: 'customer123',
      phone: '082345678901', role: 'CUSTOMER', createdAt: new Date('2024-02-15'), isActive: true,
      address: { id: 'addr2', label: 'Rumah', recipientName: 'Budi Santoso', phone: '082345678901', address: 'Jl. Melati No. 25 RT 03 RW 04', city: 'Jakarta Timur', province: 'DKI Jakarta', postalCode: '13210', isDefault: true },
    },
    {
      id: 'user3', name: 'Siti Rahayu', email: 'siti@email.com', password: 'customer123',
      phone: '083456789012', role: 'CUSTOMER', createdAt: new Date('2024-03-20'), isActive: true,
      address: { id: 'addr3', label: 'Rumah', recipientName: 'Siti Rahayu', phone: '083456789012', address: 'Jl. Mawar Indah No. 12', city: 'Depok', province: 'Jawa Barat', postalCode: '16415', isDefault: true },
    },
    {
      id: 'user4', name: 'Ahmad Fauzi', email: 'ahmad@email.com', password: 'customer123',
      phone: '084567890123', role: 'CUSTOMER', createdAt: new Date('2024-04-10'), isActive: true,
      address: { id: 'addr4', label: 'Rumah', recipientName: 'Ahmad Fauzi', phone: '084567890123', address: 'Jl. Kenanga No. 7 Blok C', city: 'Bekasi', province: 'Jawa Barat', postalCode: '17111', isDefault: true },
    },
    {
      id: 'user5', name: 'Dewi Lestari', email: 'dewi@email.com', password: 'customer123',
      phone: '085678901234', role: 'CUSTOMER', createdAt: new Date('2024-05-05'), isActive: true,
      address: { id: 'addr5', label: 'Rumah', recipientName: 'Dewi Lestari', phone: '085678901234', address: 'Perumahan Griya Indah B-12', city: 'Tangerang', province: 'Banten', postalCode: '15117', isDefault: true },
    },
    {
      id: 'user6', name: 'Rini Wulandari', email: 'rini@email.com', password: 'customer123',
      phone: '086789012345', role: 'CUSTOMER', createdAt: new Date('2024-05-18'), isActive: false,
    },
    {
      id: 'user7', name: 'Eko Prasetyo', email: 'eko@email.com', password: 'customer123',
      phone: '087890123456', role: 'CUSTOMER', createdAt: new Date('2024-06-01'), isActive: true,
    },
    {
      id: 'user8', name: 'Nurul Hidayah', email: 'nurul@email.com', password: 'customer123',
      phone: '088901234567', role: 'CUSTOMER', createdAt: new Date('2024-06-15'), isActive: true,
    },
  ];

  for (const u of usersData) {
    const { address, ...userData } = u;
    
    // Gunakan upsert agar tidak error jika data ID sudah ada
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

  // 5. Seed Orders (Contoh satu order)
 const ordersData = [
  {
    id: 'ord1',
    orderNumber: 'ORD-2024-001',
    userId: 'user2',
    totalAmount: 695000,
    shippingCost: 25000,
    status: 'DELIVERED',
    paymentStatus: 'PAID',
    paymentMethod: 'TRANSFER',
    trackingNumber: 'JNE2024001234',
    courier: 'JNE',
    shippingRecipient: 'Budi Santoso',
    shippingPhone: '082345678901',
    shippingAddress: 'Jl. Melati No. 25',
    shippingCity: 'Jakarta Timur',
    shippingProvince: 'DKI Jakarta',
    shippingPostalCode: '13210',
    createdAt: new Date('2024-04-01T08:00:00'),
    updatedAt: new Date('2024-04-05T14:00:00'),
    items: { // GANTI DARI orderItems KE items
      create: [
        { id: 'item1', productId: 'prod2', quantity: 2, price: 285000 },
        { id: 'item2', productId: 'prod13', quantity: 1, price: 95000 }
      ]
    }
  },
  {
    id: 'ord2',
    orderNumber: 'ORD-2024-002',
    userId: 'user3',
    totalAmount: 280000,
    shippingCost: 20000,
    status: 'SHIPPED',
    paymentStatus: 'PAID',
    paymentMethod: 'MIDTRANS',
    trackingNumber: 'SICEPAT2024005678',
    courier: 'SiCepat',
    shippingRecipient: 'Siti Rahayu',
    shippingPhone: '083456789012',
    shippingAddress: 'Jl. Mawar Indah No. 12',
    shippingCity: 'Depok',
    shippingProvince: 'Jawa Barat',
    shippingPostalCode: '16415',
    createdAt: new Date('2024-04-10T10:30:00'),
    updatedAt: new Date('2024-04-13T11:00:00'),
    items: { // GANTI DARI orderItems KE items
      create: [
        { id: 'item3', productId: 'prod1', quantity: 3, price: 85000 }
      ]
    }
  },
{
    id: 'ord3',
    orderNumber: 'ORD-2024-003',
    userId: 'user4',
    totalAmount: 206000,
    shippingCost: 15000,
    status: 'PROCESSING',
    paymentStatus: 'PAID',
    paymentMethod: 'EWALLET',
    shippingRecipient: 'Ahmad Fauzi',
    shippingPhone: '084567890123',
    shippingAddress: 'Jl. Kenanga No. 7',
    shippingCity: 'Bekasi',
    shippingProvince: 'Jawa Barat',
    shippingPostalCode: '17111',
    createdAt: new Date('2024-04-15T14:00:00'),
    updatedAt: new Date('2024-04-16T09:00:00'),
    items: {
      create: [
        { id: 'item4', productId: 'prod11', quantity: 1, price: 125000 },
        { id: 'item5', productId: 'prod12', quantity: 2, price: 28000 }
      ]
    }
  },
  {
    id: 'ord4',
    orderNumber: 'ORD-2024-004',
    userId: 'user5',
    totalAmount: 164500,
    shippingCost: 20000,
    status: 'CONFIRMED',
    paymentStatus: 'PENDING', // Diubah dari WAITING_VERIFICATION agar sesuai enum standar
    paymentMethod: 'TRANSFER',
    paymentProofUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
    shippingRecipient: 'Dewi Lestari',
    shippingPhone: '085678901234',
    shippingAddress: 'Griya Indah B-12',
    shippingCity: 'Tangerang',
    shippingProvince: 'Banten',
    shippingPostalCode: '15117',
    createdAt: new Date('2024-04-18T16:30:00'),
    updatedAt: new Date('2024-04-18T20:00:00'),
    items: {
      create: [
        { id: 'item6', productId: 'prod7', quantity: 5, price: 18500 },
        { id: 'item7', productId: 'prod8', quantity: 2, price: 26000 }
      ]
    }
  },
  {
    id: 'ord5',
    orderNumber: 'ORD-2024-005',
    userId: 'user7',
    totalAmount: 480000,
    shippingCost: 25000,
    status: 'PENDING',
    paymentStatus: 'PENDING',
    paymentMethod: 'TRANSFER',
    shippingRecipient: 'Eko Prasetyo',
    shippingPhone: '087890123456',
    shippingAddress: 'Jl. Anggrek No. 3',
    shippingCity: 'Surabaya',
    shippingProvince: 'Jawa Timur',
    shippingPostalCode: '60232',
    createdAt: new Date('2024-04-20T09:15:00'),
    updatedAt: new Date('2024-04-20T09:15:00'),
    items: {
      create: [
        { id: 'item8', productId: 'prod3', quantity: 2, price: 195000 },
        { id: 'item9', productId: 'prod16', quantity: 1, price: 65000 }
      ]
    }
  },
  {
    id: 'ord6',
    orderNumber: 'ORD-2024-006',
    userId: 'user8',
    totalAmount: 490000,
    shippingCost: 25000,
    status: 'CANCELLED',
    paymentStatus: 'REFUNDED',
    paymentMethod: 'MIDTRANS',
    shippingRecipient: 'Nurul Hidayah',
    shippingPhone: '088901234567',
    shippingAddress: 'Jl. Cendana No. 8',
    shippingCity: 'Bandung',
    shippingProvince: 'Jawa Barat',
    shippingPostalCode: '40114',
    createdAt: new Date('2024-04-05T11:00:00'),
    updatedAt: new Date('2024-04-06T10:00:00'),
    items: {
      create: [
        { id: 'item10', productId: 'prod5', quantity: 1, price: 320000 },
        { id: 'item11', productId: 'prod15', quantity: 1, price: 145000 }
      ]
    }
  },
  {
    id: 'ord7',
    orderNumber: 'ORD-2024-007',
    userId: 'user2',
    totalAmount: 515000,
    shippingCost: 30000,
    status: 'PENDING',
    paymentStatus: 'PENDING',
    shippingRecipient: 'Budi Santoso',
    shippingPhone: '082345678901',
    shippingAddress: 'Jl. Melati No. 25',
    shippingCity: 'Jakarta Timur',
    shippingProvince: 'DKI Jakarta',
    shippingPostalCode: '13210',
    createdAt: new Date('2024-04-22T13:00:00'),
    updatedAt: new Date('2024-04-22T13:00:00'),
    items: {
      create: [
        { id: 'item12', productId: 'prod18', quantity: 1, price: 485000 }
      ]
    }
  }
];

for (const order of ordersData) {
    await prisma.order.create({ data: order });
  }
  // // 6. Seed Order Items
  // await prisma.orderItem.createMany({
  //   data: [
  //     { orderId: createdOrder.id, productId: 'prod2', quantity: 2, price: 285000 },
  //     { orderId: createdOrder.id, productId: 'prod1', quantity: 1, price: 95000 },
  //   ]
  // });

  console.log('Seeding selesai!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });