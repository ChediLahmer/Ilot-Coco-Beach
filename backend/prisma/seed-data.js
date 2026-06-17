import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding data for pagination testing...");

  // --- Menu Categories & Items ---
  const categoryNames = [
    "Entrées",
    "Plats Principaux",
    "Desserts",
    "Boissons",
    "Grillades",
    "Salades",
    "Pizzas",
    "Pâtes",
    "Fruits de Mer",
    "Petit-déjeuner",
  ];

  for (let i = 0; i < categoryNames.length; i++) {
    const cat = await prisma.menuCategory.create({
      data: {
        name: {
          fr: categoryNames[i],
          en: categoryNames[i],
          ar: categoryNames[i],
        },
        order: i,
      },
    });

    // 8 items per category = 80 total items
    const items = [];
    for (let j = 0; j < 8; j++) {
      items.push({
        name: {
          fr: `${categoryNames[i]} Item ${j + 1}`,
          en: `${categoryNames[i]} Item ${j + 1}`,
          ar: `طبق ${j + 1}`,
        },
        description: {
          fr: `Description du plat ${j + 1}`,
          en: `Dish description ${j + 1}`,
          ar: `وصف ${j + 1}`,
        },
        priceStandard: 10 + j * 3,
        priceExtra: 15 + j * 3,
        available: j % 4 !== 0, // some unavailable
        visible: j % 5 !== 0, // some hidden
        categoryId: cat.id,
        order: j,
      });
    }
    await prisma.menuItem.createMany({ data: items });
  }
  console.log("✓ 10 categories, 80 menu items");

  // --- Spaces ---
  const spaceData = [];
  for (let i = 0; i < 30; i++) {
    spaceData.push({
      name: {
        fr: `Espace ${i + 1}`,
        en: `Space ${i + 1}`,
        ar: `مساحة ${i + 1}`,
      },
      description: {
        fr: `Description de l'espace ${i + 1}`,
        en: `Space ${i + 1} description`,
        ar: `وصف ${i + 1}`,
      },
      price: 50 + i * 10,
      capacity: 2 + (i % 8),
      available: i % 3 !== 0,
      visible: i % 4 !== 0,
      order: i,
    });
  }
  await prisma.space.createMany({ data: spaceData });
  console.log("✓ 30 spaces");

  // --- Flash Sales ---
  const flashData = [];
  for (let i = 0; i < 35; i++) {
    const daysOffset = i % 2 === 0 ? 30 : -5; // some expired
    flashData.push({
      title: {
        fr: `Vente Flash ${i + 1}`,
        en: `Flash Sale ${i + 1}`,
        ar: `تخفيض ${i + 1}`,
      },
      description: {
        fr: `Profitez de ${10 + i}% de réduction!`,
        en: `Get ${10 + i}% off!`,
        ar: `خصم ${10 + i}%`,
      },
      discountPercent: 10 + (i % 50),
      endsAt: new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000),
      isActive: i % 3 !== 0,
      visible: i % 4 !== 0,
    });
  }
  await prisma.flashSale.createMany({ data: flashData });
  console.log("✓ 35 flash sales");

  // --- Vouchers ---
  const voucherData = [];
  for (let i = 0; i < 40; i++) {
    const daysOffset = i % 3 === 0 ? -10 : 60;
    voucherData.push({
      code: `PROMO${String(i + 1).padStart(3, "0")}`,
      discountPercent: 5 + (i % 40),
      validUntil: new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000),
      isActive: i % 3 !== 0,
      visible: i % 5 !== 0,
    });
  }
  await prisma.voucher.createMany({ data: voucherData });
  console.log("✓ 40 vouchers");

  // --- Gallery Images ---
  const galleryCat = await prisma.galleryCategory.create({
    data: { name: { fr: "Ambiance", en: "Ambiance", ar: "أجواء" }, order: 0 },
  });
  const galleryCat2 = await prisma.galleryCategory.create({
    data: { name: { fr: "Plage", en: "Beach", ar: "شاطئ" }, order: 1 },
  });

  const galleryData = [];
  for (let i = 0; i < 50; i++) {
    galleryData.push({
      url: `https://picsum.photos/seed/coco${i}/800/600`,
      alt: `Gallery image ${i + 1}`,
      categoryId: i % 2 === 0 ? galleryCat.id : galleryCat2.id,
      order: i,
      visible: i % 6 !== 0,
    });
  }
  await prisma.galleryImage.createMany({ data: galleryData });
  console.log("✓ 50 gallery images");

  console.log("\n✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
