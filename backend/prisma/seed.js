import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

function picsum(seed, width = 1600, height = 1000) {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

async function main() {
  // ── Truncate all tables (dependency order) ──────────────
  await prisma.$transaction([
    prisma.analyticsEvent.deleteMany(),
    prisma.reviewStats.deleteMany(),
    prisma.review.deleteMany(),
    prisma.flashSale.deleteMany(),
    prisma.menuItem.deleteMany(),
    prisma.galleryImage.deleteMany(),
    prisma.menuCategory.deleteMany(),
    prisma.galleryCategory.deleteMany(),
    prisma.space.deleteMany(),
    prisma.voucher.deleteMany(),
    prisma.passwordReset.deleteMany(),
    prisma.siteConfig.deleteMany(),
  ]);

  // ── Admin ───────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.admin.upsert({
    where: { email: "chedi.lahmer47@gmail.com" },
    update: {},
    create: { email: "chedi.lahmer47@gmail.com", password: hashedPassword },
  });

  // ── Site Config ─────────────────────────────────────────
  const configs = {
    name: "Ilot Coco Beach",
    phone: "+216 99 123 456",
    whatsapp: "21699123456",
    email: "contact@ilotcocobeach.com",
    instagram: "https://www.instagram.com/ilotcocobeach",
    messenger: "https://m.me/ilotcocobeach",
    facebook: "https://www.facebook.com/IlotCocoBeach",
    tiktok: "https://www.tiktok.com/@ilotcocobeach",
    address: "Ghar El Melh, Bizerte, Tunisie",
    hours: JSON.stringify({
      fr: "Tous les jours 10h – 00h",
      en: "Daily 10 AM – 12 AM",
      ar: "يومياً 10 صباحاً – 12 ليلاً",
    }),
    lat: "37.1476125",
    lng: "10.2133906",
    satisfaction_rate: "96",
    show_reviews: "true",
  };

  for (const [key, value] of Object.entries(configs)) {
    await prisma.siteConfig.create({ data: { key, value } });
  }

  // ── Menu Categories + Items ─────────────────────────────
  const categories = [
    {
      name: { fr: "Entrées", en: "Starters", ar: "مقبلات" },
      order: 1,
      items: [
        {
          name: {
            fr: "Salade Méditerranéenne",
            en: "Mediterranean Salad",
            ar: "سلطة متوسطية",
          },
          description: {
            fr: "Tomates, concombres, olives, feta et huile d'olive",
            en: "Tomatoes, cucumbers, olives, feta and olive oil",
            ar: "طماطم، خيار، زيتون، فيتا وزيت زيتون",
          },
          priceStandard: 12,
          priceExtra: 18,
          available: true,
          order: 1,
        },
        {
          name: {
            fr: "Salade Mechouia",
            en: "Mechouia Salad",
            ar: "سلطة مشوية",
          },
          description: {
            fr: "Poivrons et tomates grillés, ail, huile d'olive",
            en: "Grilled peppers and tomatoes, garlic, olive oil",
            ar: "فلفل وطماطم مشوية، ثوم، زيت زيتون",
          },
          priceStandard: 10,
          priceExtra: 15,
          available: true,
          order: 2,
        },
        {
          name: { fr: "Brick au Thon", en: "Tuna Brick", ar: "بريك بالتونة" },
          description: {
            fr: "Pâte croustillante farcie au thon et œuf",
            en: "Crispy pastry stuffed with tuna and egg",
            ar: "عجينة مقرمشة محشوة بالتونة والبيض",
          },
          priceStandard: 8,
          priceExtra: 12,
          available: true,
          order: 3,
        },
        {
          name: {
            fr: "Ojja aux Crevettes",
            en: "Shrimp Ojja",
            ar: "عجة بالقمبري",
          },
          description: {
            fr: "Tomates épicées, poivrons, crevettes et œufs pochés",
            en: "Spiced tomatoes, peppers, shrimp and poached eggs",
            ar: "طماطم حارة، فلفل، قمبري وبيض",
          },
          priceStandard: 14,
          priceExtra: 20,
          available: true,
          order: 4,
        },
        {
          name: {
            fr: "Assortiment de Mezze",
            en: "Mezze Platter",
            ar: "تشكيلة مزة",
          },
          description: {
            fr: "Houmous, baba ghanoush, taboulé et pain pita",
            en: "Hummus, baba ghanoush, tabbouleh and pita bread",
            ar: "حمص، بابا غنوج، تبولة وخبز بيتا",
          },
          priceStandard: 16,
          priceExtra: 22,
          available: true,
          order: 5,
        },
        {
          name: { fr: "Soupe de Poissons", en: "Fish Soup", ar: "شوربة سمك" },
          description: {
            fr: "Bouillon parfumé de poissons frais, croûtons et rouille",
            en: "Fragrant fresh fish broth, croutons and rouille",
            ar: "مرق سمك طازج معطر مع خبز محمص",
          },
          priceStandard: 11,
          priceExtra: 16,
          available: true,
          order: 6,
        },
        {
          name: {
            fr: "Tartare de Thon",
            en: "Tuna Tartare",
            ar: "تارتار التونة",
          },
          description: {
            fr: "Thon rouge frais coupé au couteau, avocat et sésame",
            en: "Fresh red tuna hand-cut, avocado and sesame",
            ar: "تونة حمراء طازجة مقطعة يدوياً، أفوكادو وسمسم",
          },
          priceStandard: 18,
          priceExtra: 25,
          available: true,
          order: 7,
        },
        {
          name: {
            fr: "Beignets de Calamars",
            en: "Calamari Fritters",
            ar: "بينيي الكالاماري",
          },
          description: {
            fr: "Calamars panés et frits, sauce tartare maison",
            en: "Breaded and fried calamari, homemade tartar sauce",
            ar: "كالاماري مقلي مع صلصة تارتار منزلية",
          },
          priceStandard: 13,
          priceExtra: 18,
          available: false,
          order: 8,
        },
      ],
    },
    {
      name: { fr: "Plats Principaux", en: "Main Courses", ar: "أطباق رئيسية" },
      order: 2,
      items: [
        {
          name: {
            fr: "Daurade Grillée",
            en: "Grilled Sea Bream",
            ar: "سمك الدوراد المشوي",
          },
          description: {
            fr: "Daurade fraîche grillée au charbon avec légumes de saison",
            en: "Fresh charcoal-grilled sea bream with seasonal vegetables",
            ar: "دوراد طازج مشوي على الفحم مع خضار الموسم",
          },
          priceStandard: 35,
          priceExtra: 48,
          available: true,
          order: 1,
        },
        {
          name: { fr: "Loup de Mer", en: "Sea Bass", ar: "قاروص" },
          description: {
            fr: "Filet de loup grillé, sauce citron et câpres",
            en: "Grilled sea bass fillet, lemon caper sauce",
            ar: "فيليه قاروص مشوي مع صلصة الليمون والكبر",
          },
          priceStandard: 40,
          priceExtra: 55,
          available: true,
          order: 2,
        },
        {
          name: {
            fr: "Crevettes Flambées",
            en: "Flambéed Shrimp",
            ar: "قمبري مشعل",
          },
          description: {
            fr: "Crevettes royales flambées au pastis, riz parfumé",
            en: "Royal shrimp flambéed with pastis, fragrant rice",
            ar: "قمبري ملكي مشعل مع أرز معطر",
          },
          priceStandard: 45,
          priceExtra: 60,
          available: true,
          order: 3,
        },
        {
          name: {
            fr: "Poulpe Grillé",
            en: "Grilled Octopus",
            ar: "أخطبوط مشوي",
          },
          description: {
            fr: "Poulpe tendre grillé, pommes de terre et herbes",
            en: "Tender grilled octopus, potatoes and herbs",
            ar: "أخطبوط طري مشوي مع بطاطا وأعشاب",
          },
          priceStandard: 38,
          priceExtra: 50,
          available: false,
          order: 4,
        },
        {
          name: {
            fr: "Couscous au Poisson",
            en: "Fish Couscous",
            ar: "كسكس بالسمك",
          },
          description: {
            fr: "Couscous traditionnel aux poissons variés et légumes",
            en: "Traditional couscous with mixed fish and vegetables",
            ar: "كسكس تقليدي بالسمك والخضر",
          },
          priceStandard: 32,
          priceExtra: 45,
          available: true,
          order: 5,
        },
        {
          name: {
            fr: "Paella Fruits de Mer",
            en: "Seafood Paella",
            ar: "باييلا بثمار البحر",
          },
          description: {
            fr: "Riz safrané aux crevettes, moules et calamars",
            en: "Saffron rice with shrimp, mussels and calamari",
            ar: "أرز بالزعفران مع قمبري وبلح البحر والكالاماري",
          },
          priceStandard: 42,
          priceExtra: 58,
          available: true,
          order: 6,
        },
        {
          name: {
            fr: "Tajine de Mérou",
            en: "Grouper Tagine",
            ar: "طاجين الميرو",
          },
          description: {
            fr: "Mérou mijoté aux olives, citron confit et herbes fraîches",
            en: "Grouper braised with olives, preserved lemon and fresh herbs",
            ar: "ميرو مطبوخ بالزيتون والليمون المخلل والأعشاب",
          },
          priceStandard: 36,
          priceExtra: 50,
          available: true,
          order: 7,
        },
        {
          name: {
            fr: "Risotto aux Fruits de Mer",
            en: "Seafood Risotto",
            ar: "ريزوتو بثمار البحر",
          },
          description: {
            fr: "Risotto crémeux aux crevettes, moules et parmesan",
            en: "Creamy risotto with shrimp, mussels and parmesan",
            ar: "ريزوتو كريمي بالقمبري وبلح البحر والبارميزان",
          },
          priceStandard: 34,
          priceExtra: 48,
          available: true,
          order: 8,
        },
      ],
    },
    {
      name: { fr: "Desserts", en: "Desserts", ar: "حلويات" },
      order: 3,
      items: [
        {
          name: {
            fr: "Fruits de Saison",
            en: "Seasonal Fruits",
            ar: "فواكه الموسم",
          },
          description: {
            fr: "Assortiment de fruits frais de saison",
            en: "Assortment of fresh seasonal fruits",
            ar: "تشكيلة فواكه طازجة من الموسم",
          },
          priceStandard: 8,
          priceExtra: 12,
          available: true,
          order: 1,
        },
        {
          name: {
            fr: "Crème Brûlée Coco",
            en: "Coconut Crème Brûlée",
            ar: "كريم بروليه جوز الهند",
          },
          description: {
            fr: "Crème brûlée parfumée à la noix de coco",
            en: "Coconut-flavored crème brûlée",
            ar: "كريم بروليه بنكهة جوز الهند",
          },
          priceStandard: 10,
          priceExtra: 14,
          available: true,
          order: 2,
        },
        {
          name: {
            fr: "Fondant au Chocolat",
            en: "Chocolate Fondant",
            ar: "فوندون الشوكولاتة",
          },
          description: {
            fr: "Cœur coulant au chocolat noir, glace vanille",
            en: "Dark chocolate molten cake, vanilla ice cream",
            ar: "كعكة شوكولاتة سائلة مع آيس كريم فانيلا",
          },
          priceStandard: 12,
          priceExtra: 16,
          available: true,
          order: 3,
        },
        {
          name: {
            fr: "Tiramisu à la Datte",
            en: "Date Tiramisu",
            ar: "تيراميسو بالتمر",
          },
          description: {
            fr: "Tiramisu revisité aux dattes tunisiennes et café",
            en: "Tiramisu revisited with Tunisian dates and coffee",
            ar: "تيراميسو بالتمر التونسي والقهوة",
          },
          priceStandard: 11,
          priceExtra: 15,
          available: true,
          order: 4,
        },
        {
          name: {
            fr: "Panna Cotta Mangue",
            en: "Mango Panna Cotta",
            ar: "بانا كوتا بالمانجو",
          },
          description: {
            fr: "Panna cotta onctueuse au coulis de mangue fraîche",
            en: "Smooth panna cotta with fresh mango coulis",
            ar: "بانا كوتا ناعمة مع صلصة المانجو الطازجة",
          },
          priceStandard: 10,
          priceExtra: 14,
          available: true,
          order: 5,
        },
        {
          name: {
            fr: "Baklawa Maison",
            en: "Homemade Baklava",
            ar: "بقلاوة منزلية",
          },
          description: {
            fr: "Feuilleté croustillant aux amandes, pistaches et miel",
            en: "Crispy pastry with almonds, pistachios and honey",
            ar: "فطيرة مقرمشة باللوز والفستق والعسل",
          },
          priceStandard: 9,
          priceExtra: 13,
          available: true,
          order: 6,
        },
        {
          name: {
            fr: "Sorbet Citron Basilic",
            en: "Lemon Basil Sorbet",
            ar: "سوربيه ليمون وريحان",
          },
          description: {
            fr: "Sorbet rafraîchissant au citron et basilic frais",
            en: "Refreshing sorbet with lemon and fresh basil",
            ar: "سوربيه منعش بالليمون والريحان الطازج",
          },
          priceStandard: 7,
          priceExtra: 10,
          available: true,
          order: 7,
        },
      ],
    },
    {
      name: { fr: "Boissons", en: "Drinks", ar: "مشروبات" },
      order: 4,
      items: [
        {
          name: {
            fr: "Cocktail Tropical",
            en: "Tropical Cocktail",
            ar: "كوكتيل استوائي",
          },
          description: {
            fr: "Mangue, ananas, fruit de la passion",
            en: "Mango, pineapple, passion fruit",
            ar: "مانجو، أناناس، فاكهة الباشن",
          },
          priceStandard: 12,
          priceExtra: 18,
          available: true,
          order: 1,
        },
        {
          name: {
            fr: "Smoothie Coco Beach",
            en: "Coco Beach Smoothie",
            ar: "سموثي كوكو بيتش",
          },
          description: {
            fr: "Noix de coco, banane, lait d'amande",
            en: "Coconut, banana, almond milk",
            ar: "جوز الهند، موز، حليب اللوز",
          },
          priceStandard: 10,
          priceExtra: 14,
          available: true,
          order: 2,
        },
        {
          name: {
            fr: "Citronnade Maison",
            en: "Homemade Lemonade",
            ar: "عصير ليمون منزلي",
          },
          description: {
            fr: "Citron frais pressé, menthe et miel",
            en: "Fresh pressed lemon, mint and honey",
            ar: "ليمون طازج معصور، نعناع وعسل",
          },
          priceStandard: 7,
          priceExtra: 10,
          available: true,
          order: 3,
        },
        {
          name: { fr: "Thé à la Menthe", en: "Mint Tea", ar: "شاي بالنعناع" },
          description: {
            fr: "Thé vert infusé à la menthe fraîche et pignons de pin",
            en: "Green tea infused with fresh mint and pine nuts",
            ar: "شاي أخضر بالنعناع الطازج والصنوبر",
          },
          priceStandard: 5,
          priceExtra: 8,
          available: true,
          order: 4,
        },
        {
          name: {
            fr: "Jus d'Orange Pressé",
            en: "Fresh Orange Juice",
            ar: "عصير برتقال طازج",
          },
          description: {
            fr: "Oranges fraîches pressées à la minute",
            en: "Freshly squeezed oranges on the spot",
            ar: "برتقال طازج معصور في الحال",
          },
          priceStandard: 6,
          priceExtra: 9,
          available: true,
          order: 5,
        },
        {
          name: {
            fr: "Mojito Vierge",
            en: "Virgin Mojito",
            ar: "موخيتو بدون كحول",
          },
          description: {
            fr: "Citron vert, menthe fraîche, eau gazeuse et sucre de canne",
            en: "Lime, fresh mint, sparkling water and cane sugar",
            ar: "ليمون أخضر، نعناع طازج، ماء غازي وسكر قصب",
          },
          priceStandard: 9,
          priceExtra: 13,
          available: true,
          order: 6,
        },
        {
          name: {
            fr: "Café Glacé Coco",
            en: "Iced Coconut Coffee",
            ar: "قهوة مثلجة بجوز الهند",
          },
          description: {
            fr: "Café froid, lait de coco, glace pilée et caramel",
            en: "Cold coffee, coconut milk, crushed ice and caramel",
            ar: "قهوة باردة، حليب جوز الهند، ثلج مجروش وكراميل",
          },
          priceStandard: 11,
          priceExtra: 15,
          available: true,
          order: 7,
        },
        {
          name: {
            fr: "Eau de Coco Fraîche",
            en: "Fresh Coconut Water",
            ar: "ماء جوز الهند الطازج",
          },
          description: {
            fr: "Eau de coco naturelle servie dans la noix",
            en: "Natural coconut water served in the shell",
            ar: "ماء جوز الهند الطبيعي مقدم في القشرة",
          },
          priceStandard: 8,
          priceExtra: 12,
          available: true,
          order: 8,
        },
      ],
    },
    {
      name: { fr: "Grillades", en: "Grills", ar: "مشويات" },
      order: 5,
      items: [
        {
          name: {
            fr: "Brochettes de Crevettes",
            en: "Shrimp Skewers",
            ar: "أسياخ القمبري",
          },
          description: {
            fr: "Crevettes marinées grillées au feu de bois, sauce chermoula",
            en: "Marinated shrimp grilled over wood fire, chermoula sauce",
            ar: "قمبري متبل مشوي على الحطب مع صلصة الشرمولة",
          },
          priceStandard: 28,
          priceExtra: 38,
          available: true,
          order: 1,
        },
        {
          name: {
            fr: "Côte d'Agneau Grillée",
            en: "Grilled Lamb Chops",
            ar: "ريش الغنم المشوية",
          },
          description: {
            fr: "Côtes d'agneau marinées aux herbes, grillées à la perfection",
            en: "Herb-marinated lamb chops, grilled to perfection",
            ar: "ريش غنم متبلة بالأعشاب ومشوية بإتقان",
          },
          priceStandard: 38,
          priceExtra: 52,
          available: true,
          order: 2,
        },
        {
          name: {
            fr: "Brochettes Mixtes",
            en: "Mixed Skewers",
            ar: "أسياخ مشكلة",
          },
          description: {
            fr: "Assortiment de viandes et poissons grillés au charbon",
            en: "Assortment of charcoal-grilled meats and fish",
            ar: "تشكيلة لحوم وأسماك مشوية على الفحم",
          },
          priceStandard: 35,
          priceExtra: 48,
          available: true,
          order: 3,
        },
        {
          name: {
            fr: "Poulet Grillé aux Épices",
            en: "Spiced Grilled Chicken",
            ar: "دجاج مشوي بالتوابل",
          },
          description: {
            fr: "Demi-poulet mariné aux épices tunisiennes, grillé lentement",
            en: "Half chicken marinated in Tunisian spices, slow-grilled",
            ar: "نصف دجاجة متبلة بالتوابل التونسية ومشوية ببطء",
          },
          priceStandard: 25,
          priceExtra: 35,
          available: true,
          order: 4,
        },
        {
          name: {
            fr: "Entrecôte de Bœuf",
            en: "Beef Rib-Eye",
            ar: "أنتركوت بقر",
          },
          description: {
            fr: "Entrecôte de bœuf grillée, beurre aux herbes",
            en: "Grilled beef rib-eye, herb butter",
            ar: "أنتركوت بقر مشوي مع زبدة الأعشاب",
          },
          priceStandard: 42,
          priceExtra: 58,
          available: true,
          order: 5,
        },
        {
          name: {
            fr: "Merguez Maison",
            en: "Homemade Merguez",
            ar: "مرقاز منزلي",
          },
          description: {
            fr: "Saucisses merguez faites maison, grillées au charbon",
            en: "Homemade merguez sausages, charcoal-grilled",
            ar: "مرقاز منزلي مشوي على الفحم",
          },
          priceStandard: 18,
          priceExtra: 25,
          available: true,
          order: 6,
        },
        {
          name: {
            fr: "Plateau Royal Grillades",
            en: "Royal Grill Platter",
            ar: "طبق المشويات الملكي",
          },
          description: {
            fr: "Sélection de viandes et fruits de mer grillés pour 2 personnes",
            en: "Selection of grilled meats and seafood for 2",
            ar: "تشكيلة لحوم وثمار بحر مشوية لشخصين",
          },
          priceStandard: 75,
          priceExtra: 95,
          available: true,
          order: 7,
        },
      ],
    },
    {
      name: { fr: "Accompagnements", en: "Sides", ar: "مرافقات" },
      order: 6,
      items: [
        {
          name: {
            fr: "Frites Maison",
            en: "Homemade Fries",
            ar: "بطاطا مقلية منزلية",
          },
          description: {
            fr: "Frites croustillantes coupées à la main",
            en: "Hand-cut crispy fries",
            ar: "بطاطا مقلية مقرمشة مقطعة يدوياً",
          },
          priceStandard: 6,
          priceExtra: 9,
          available: true,
          order: 1,
        },
        {
          name: {
            fr: "Riz Parfumé au Safran",
            en: "Saffron Rice",
            ar: "أرز بالزعفران",
          },
          description: {
            fr: "Riz basmati cuit au safran et amandes grillées",
            en: "Basmati rice cooked with saffron and toasted almonds",
            ar: "أرز بسمتي بالزعفران واللوز المحمص",
          },
          priceStandard: 7,
          priceExtra: 10,
          available: true,
          order: 2,
        },
        {
          name: {
            fr: "Légumes Grillés",
            en: "Grilled Vegetables",
            ar: "خضار مشوية",
          },
          description: {
            fr: "Courgettes, poivrons, aubergines grillés à l'huile d'olive",
            en: "Zucchini, peppers, eggplant grilled with olive oil",
            ar: "كوسا، فلفل، باذنجان مشوي بزيت الزيتون",
          },
          priceStandard: 8,
          priceExtra: 12,
          available: true,
          order: 3,
        },
        {
          name: { fr: "Salade Verte", en: "Green Salad", ar: "سلطة خضراء" },
          description: {
            fr: "Mesclun, roquette, vinaigrette balsamique",
            en: "Mixed greens, arugula, balsamic vinaigrette",
            ar: "خضار ورقية، جرجير، صلصة بلسمية",
          },
          priceStandard: 5,
          priceExtra: 8,
          available: true,
          order: 4,
        },
        {
          name: {
            fr: "Purée de Patate Douce",
            en: "Sweet Potato Mash",
            ar: "بوريه البطاطا الحلوة",
          },
          description: {
            fr: "Purée onctueuse de patate douce au beurre",
            en: "Smooth sweet potato mash with butter",
            ar: "بوريه بطاطا حلوة ناعم بالزبدة",
          },
          priceStandard: 7,
          priceExtra: 10,
          available: true,
          order: 5,
        },
        {
          name: { fr: "Pain Tabouna", en: "Tabouna Bread", ar: "خبز طابونة" },
          description: {
            fr: "Pain traditionnel tunisien cuit au four à bois",
            en: "Traditional Tunisian bread baked in wood oven",
            ar: "خبز تونسي تقليدي مخبوز في فرن الحطب",
          },
          priceStandard: 3,
          priceExtra: 5,
          available: true,
          order: 6,
        },
      ],
    },
  ];

  categories.forEach((category, categoryIndex) => {
    for (let index = 1; index <= 6; index += 1) {
      category.items.push({
        name: {
          fr: `${category.name.fr} Signature ${index}`,
          en: `${category.name.en} Signature ${index}`,
          ar: `${category.name.ar} ${index}`,
        },
        description: {
          fr: `Variation ${index} pensée pour les services chargés et les grandes tables.`,
          en: `Variation ${index} designed for busier service and larger tables.`,
          ar: `نسخة ${index} مصممة لأوقات الذروة والطاولات الكبيرة.`,
        },
        image:
          index % 2 === 0
            ? picsum(`menu-${categoryIndex + 1}-${index}`, 1200, 900)
            : null,
        priceStandard: 8 + categoryIndex * 5 + index * 2,
        priceExtra: 12 + categoryIndex * 7 + index * 3,
        available: index % 5 !== 0,
        order: category.items.length + 1,
      });
    }
  });

  for (const cat of categories) {
    const created = await prisma.menuCategory.create({
      data: { name: cat.name, order: cat.order },
    });
    for (const item of cat.items) {
      await prisma.menuItem.create({
        data: { ...item, categoryId: created.id },
      });
    }
  }

  // ── Spaces ──────────────────────────────────────────────
  const spaces = [
    {
      name: {
        fr: "Cabane sur l'eau",
        en: "Overwater Cabin",
        ar: "كوخ على الماء",
      },
      description: {
        fr: "Table privée au-dessus des eaux turquoise, avec hamac et vue panoramique sur la mer.",
        en: "Private table above turquoise waters, with hammock and panoramic sea view.",
        ar: "طاولة خاصة فوق المياه الفيروزية مع أرجوحة وإطلالة بانورامية على البحر.",
      },
      price: 80,
      capacity: 6,
      order: 1,
    },
    {
      name: { fr: "Cabane sur sable", en: "Beach Cabin", ar: "كوخ على الرمل" },
      description: {
        fr: "Pergola couverte avec table en bois, coussins colorés et rideaux. Pieds dans le sable.",
        en: "Covered pergola with wooden table, colorful cushions and curtains. Feet in the sand.",
        ar: "عريشة مغطاة بطاولة خشبية ووسائد ملونة وستائر. الأقدام في الرمل.",
      },
      price: 60,
      capacity: 8,
      order: 2,
    },
    {
      name: {
        fr: "Espace Détente",
        en: "Relaxation Zone",
        ar: "منطقة الاسترخاء",
      },
      description: {
        fr: "Hamacs colorés et bean bags entre les pergolas. L'endroit idéal pour se relaxer.",
        en: "Colorful hammocks and bean bags between pergolas. The perfect spot to relax.",
        ar: "أراجيح ملونة وبين باغز بين العرائش. المكان المثالي للاسترخاء.",
      },
      price: 40,
      capacity: 4,
      order: 3,
    },
    {
      name: {
        fr: "Balade Pirate en Mer",
        en: "Sea Pirate Ride",
        ar: "جولة القراصنة في البحر",
      },
      description: {
        fr: "Aventure en bateau autour de l'île. Découvrez les criques cachées et les eaux cristallines.",
        en: "Boat adventure around the island. Discover hidden coves and crystal-clear waters.",
        ar: "مغامرة بالقارب حول الجزيرة. اكتشف الخلجان المخفية والمياه الصافية.",
      },
      price: 50,
      capacity: 10,
      order: 4,
    },
    {
      name: {
        fr: "Terrasse Panoramique",
        en: "Panoramic Terrace",
        ar: "الشرفة البانورامية",
      },
      description: {
        fr: "Terrasse surélevée offrant une vue à 360 degrés sur la mer et l'île. Parfait pour les groupes.",
        en: "Elevated terrace offering a 360-degree view of the sea and island. Perfect for groups.",
        ar: "شرفة مرتفعة بإطلالة 360 درجة على البحر والجزيرة. مثالية للمجموعات.",
      },
      price: 90,
      capacity: 8,
      order: 5,
    },
    {
      name: {
        fr: "Coin Romantique",
        en: "Romantic Corner",
        ar: "الزاوية الرومانسية",
      },
      description: {
        fr: "Table intime pour deux décorée de lanternes et voilages, face au coucher du soleil.",
        en: "Intimate table for two decorated with lanterns and drapes, facing the sunset.",
        ar: "طاولة حميمة لشخصين مزينة بالفوانيس والستائر، مقابل الغروب.",
      },
      price: 100,
      capacity: 2,
      order: 6,
    },
    {
      name: { fr: "Zone VIP", en: "VIP Zone", ar: "المنطقة المميزة" },
      description: {
        fr: "Espace exclusif avec service premium, canapés en rotin et bar privé. Réservation obligatoire.",
        en: "Exclusive space with premium service, rattan sofas and private bar. Reservation required.",
        ar: "مساحة حصرية بخدمة متميزة وأرائك من الخيزران وبار خاص. الحجز إلزامي.",
      },
      price: 120,
      capacity: 12,
      order: 7,
    },
    {
      name: { fr: "Espace Famille", en: "Family Area", ar: "مساحة العائلة" },
      description: {
        fr: "Grande zone aménagée pour les familles avec aire de jeux pour enfants et tables spacieuses.",
        en: "Large area designed for families with a children's play zone and spacious tables.",
        ar: "منطقة كبيرة مهيأة للعائلات مع منطقة ألعاب أطفال وطاولات واسعة.",
      },
      price: 70,
      capacity: 15,
      order: 8,
    },
    {
      name: {
        fr: "Cabane Lune de Miel",
        en: "Honeymoon Cabin",
        ar: "كوخ شهر العسل",
      },
      description: {
        fr: "Cabane privée décorée avec des fleurs et bougies. Idéal pour les couples en voyage de noces.",
        en: "Private cabin decorated with flowers and candles. Ideal for couples on honeymoon.",
        ar: "كوخ خاص مزين بالورود والشموع. مثالي للأزواج في شهر العسل.",
      },
      price: 110,
      capacity: 2,
      order: 9,
    },
    {
      name: {
        fr: "Spot Coucher de Soleil",
        en: "Sunset Spot",
        ar: "بقعة الغروب",
      },
      description: {
        fr: "Emplacement premium sur la pointe ouest de l'île pour admirer les plus beaux couchers de soleil.",
        en: "Premium spot on the western tip of the island to admire the most beautiful sunsets.",
        ar: "موقع مميز على الطرف الغربي للجزيرة لمشاهدة أجمل غروب الشمس.",
      },
      price: 85,
      capacity: 6,
      order: 10,
    },
  ];

  spaces.push(
    ...Array.from({ length: 10 }, (_, index) => ({
      name: {
        fr: `Salon Privé ${index + 1}`,
        en: `Private Lounge ${index + 1}`,
        ar: `جلسة خاصة ${index + 1}`,
      },
      description: {
        fr: `Espace modulable ${index + 1} avec vue mer, pensé pour tester les longues listes et les réservations nombreuses.`,
        en: `Flexible sea-view space ${index + 1} added to test long listings and larger bookings.`,
        ar: `مساحة بحرية مرنة ${index + 1} لاختبار القوائم الطويلة والحجوزات الكبيرة.`,
      },
      image: picsum(`space-${index + 1}`, 1400, 1000),
      price: 65 + index * 8,
      capacity: 4 + (index % 5) * 2,
      available: index % 4 !== 0,
      order: spaces.length + index + 1,
    })),
  );

  for (const space of spaces) {
    await prisma.space.create({ data: space });
  }

  // ── Gallery Categories + Images ────────────────────────
  const galleryCategories = [
    { name: { fr: "Arrivee", en: "Arrival", ar: "الوصول" }, order: 1 },
    { name: { fr: "Cabines", en: "Cabins", ar: "الأكواخ" }, order: 2 },
    { name: { fr: "Table", en: "Dining", ar: "الطاولة" }, order: 3 },
    { name: { fr: "Coucher de soleil", en: "Sunset", ar: "الغروب" }, order: 4 },
    { name: { fr: "Lounge", en: "Lounge", ar: "الاسترخاء" }, order: 5 },
    { name: { fr: "Evenements", en: "Events", ar: "الفعاليات" }, order: 6 },
  ];

  const createdGalleryCategories = [];
  for (const category of galleryCategories) {
    createdGalleryCategories.push(
      await prisma.galleryCategory.create({ data: category }),
    );
  }

  await prisma.galleryImage.createMany({
    data: createdGalleryCategories.flatMap((category, categoryIndex) =>
      Array.from({ length: 8 }, (_, index) => ({
        url: picsum(`gallery-${category.id}-${index + 1}`, 1600, 1100),
        alt: `${category.name.fr} ${index + 1}`,
        category:
          ["arrival", "overwater", "dining", "terrace", "lounge", "events"][
            categoryIndex
          ] || "overwater",
        categoryId: category.id,
        order: index + 1,
        visible: index % 7 !== 0,
      })),
    ),
  });

  // ── Flash Sales ─────────────────────────────────────────
  const now = Date.now();
  const flashSales = [
    {
      title: {
        fr: "Offre Spéciale Été !",
        en: "Special Summer Offer!",
        ar: "عرض الصيف الخاص!",
      },
      description: {
        fr: "Réservez une cabane sur l'eau et recevez un cocktail tropical offert pour chaque personne !",
        en: "Book an overwater cabin and receive a free tropical cocktail for each person!",
        ar: "احجز كوخاً على الماء واحصل على كوكتيل استوائي مجاني لكل شخص!",
      },
      discountPercent: 25,
      endsAt: new Date(now + 3 * 86400000 + 5 * 3600000),
    },
    {
      title: {
        fr: "Menu Dégustation -30%",
        en: "Tasting Menu -30%",
        ar: "قائمة التذوق -30%",
      },
      description: {
        fr: "Profitez de notre menu dégustation complet à prix réduit : entrée, plat, dessert et boisson inclus !",
        en: "Enjoy our full tasting menu at a reduced price: starter, main, dessert and drink included!",
        ar: "استمتع بقائمة التذوق الكاملة بسعر مخفض: مقبلات، طبق رئيسي، حلوى ومشروب!",
      },
      discountPercent: 30,
      endsAt: new Date(now + 1 * 86400000 + 3 * 3600000),
    },
    {
      title: {
        fr: "Offre Groupe 6+",
        en: "Group 6+ Offer",
        ar: "عرض المجموعات 6+",
      },
      description: {
        fr: "Venez à 6 ou plus et bénéficiez de 15% de réduction sur l'ensemble de votre réservation !",
        en: "Come as a group of 6 or more and get 15% off your entire booking!",
        ar: "احضروا كمجموعة من 6 أشخاص أو أكثر واحصلوا على خصم 15%!",
      },
      discountPercent: 15,
      endsAt: new Date(now + 5 * 86400000 + 8 * 3600000),
    },
    {
      title: {
        fr: "Happy Hour Cocktails",
        en: "Cocktail Happy Hour",
        ar: "ساعة سعيدة للكوكتيلات",
      },
      description: {
        fr: "Tous les cocktails à moitié prix de 16h à 18h !",
        en: "All cocktails half price from 4pm to 6pm!",
        ar: "جميع الكوكتيلات بنصف السعر من 4 إلى 6 مساءً!",
      },
      discountPercent: 50,
      endsAt: new Date(now + 2 * 86400000 + 6 * 3600000),
    },
    {
      title: {
        fr: "Soirée Romantique -20%",
        en: "Romantic Evening -20%",
        ar: "سهرة رومانسية -20%",
      },
      description: {
        fr: "Réservez le Coin Romantique et bénéficiez de 20% sur le dîner complet pour deux personnes.",
        en: "Book the Romantic Corner and get 20% off a complete dinner for two.",
        ar: "احجز الزاوية الرومانسية واحصل على خصم 20% على عشاء كامل لشخصين.",
      },
      discountPercent: 20,
      endsAt: new Date(now + 4 * 86400000 + 2 * 3600000),
    },
    {
      title: {
        fr: "Grillades Royales -35%",
        en: "Royal Grill -35%",
        ar: "المشويات الملكية -35%",
      },
      description: {
        fr: "Le Plateau Royal Grillades pour 2 personnes avec une réduction exceptionnelle de 35% !",
        en: "The Royal Grill Platter for 2 with an exceptional 35% discount!",
        ar: "طبق المشويات الملكي لشخصين بخصم استثنائي 35%!",
      },
      discountPercent: 35,
      endsAt: new Date(now + 6 * 86400000 + 4 * 3600000),
    },
    {
      title: {
        fr: "Terrasse VIP -40%",
        en: "VIP Terrace -40%",
        ar: "شرفة VIP -40%",
      },
      description: {
        fr: "Accès Zone VIP avec service premium à -40%. Bar privé et canapés en rotin inclus.",
        en: "VIP Zone access with premium service at -40%. Private bar and rattan sofas included.",
        ar: "دخول المنطقة المميزة بخدمة متميزة بخصم 40%. بار خاص وأرائك من الخيزران.",
      },
      discountPercent: 40,
      endsAt: new Date(now + 7 * 86400000 + 10 * 3600000),
    },
    {
      title: {
        fr: "Brunch du Dimanche",
        en: "Sunday Brunch",
        ar: "فطور يوم الأحد",
      },
      description: {
        fr: "Brunch illimité face à la mer chaque dimanche.",
        en: "Unlimited brunch by the sea every Sunday.",
        ar: "فطور غير محدود أمام البحر كل يوم أحد.",
      },
      discountPercent: 25,
      endsAt: new Date(now + 10 * 86400000 + 1 * 3600000),
    },
  ];

  flashSales.push(
    ...Array.from({ length: 12 }, (_, index) => ({
      title: {
        fr: `Offre Instantanee ${index + 1}`,
        en: `Instant Deal ${index + 1}`,
        ar: `عرض سريع ${index + 1}`,
      },
      description: {
        fr: `Promotion ${index + 1} pour tester le comportement du site avec beaucoup d'offres en meme temps.`,
        en: `Promotion ${index + 1} to test the site with many simultaneous offers.`,
        ar: `عرض ${index + 1} لاختبار الموقع مع عدد كبير من العروض في الوقت نفسه.`,
      },
      discountPercent: 10 + (index % 6) * 5,
      image: picsum(`flash-${index + 1}`, 1200, 900),
      endsAt: new Date(now + (index + 2) * 86400000 + (index % 6) * 3600000),
      isActive: index % 5 !== 0,
      visible: index % 4 !== 0,
    })),
  );

  for (const sale of flashSales) {
    await prisma.flashSale.create({ data: sale });
  }

  // ── Vouchers ────────────────────────────────────────────
  const vouchers = [
    {
      code: "ILOT2026",
      discountPercent: 15,
      validUntil: new Date("2026-08-31"),
    },
    {
      code: "SUMMER20",
      discountPercent: 20,
      validUntil: new Date("2026-07-15"),
    },
    {
      code: "FAMILY10",
      discountPercent: 10,
      validUntil: new Date("2026-09-30"),
    },
    {
      code: "BEACH50",
      discountPercent: 50,
      validUntil: new Date("2026-06-30"),
    },
    {
      code: "WEEKEND15",
      discountPercent: 15,
      validUntil: new Date("2026-12-31"),
    },
    {
      code: "GROUP25",
      discountPercent: 25,
      validUntil: new Date("2026-10-15"),
    },
    {
      code: "EARLYBIRD",
      discountPercent: 20,
      validUntil: new Date("2026-04-30"),
      isActive: false,
    },
    {
      code: "HONEYMOON",
      discountPercent: 30,
      validUntil: new Date("2026-11-30"),
    },
  ];

  vouchers.push(
    ...Array.from({ length: 18 }, (_, index) => ({
      code: `LOADTEST${String(index + 1).padStart(2, "0")}`,
      discountPercent: 5 + (index % 6) * 5,
      validUntil: new Date(2026, 5 + (index % 6), 10 + (index % 18)),
      isActive: index % 7 !== 0,
      visible: index % 6 !== 0,
    })),
  );

  for (const v of vouchers) {
    await prisma.voucher.create({ data: v });
  }

  // ── Reviews ─────────────────────────────────────────────
  const reviews = [
    {
      userName: "Sophie M.",
      comment:
        "Endroit magnifique, personnel très accueillant. On y retourne cet été !",
      rating: 5,
      visible: true,
    },
    {
      userName: "Ahmed K.",
      comment:
        "Belle plage, bonne cuisine. Le service pourrait être un peu plus rapide.",
      rating: 4,
      visible: true,
    },
    {
      userName: "Marie L.",
      comment: "Parfait pour une journée en famille. Les enfants ont adoré !",
      rating: 5,
      visible: true,
    },
    {
      userName: "Karim B.",
      comment:
        "Cadre paradisiaque. Les cocktails sont excellents et le personnel est aux petits soins.",
      rating: 4,
      visible: true,
    },
    {
      userName: "Laura T.",
      comment:
        "Un vrai petit coin de paradis. Je recommande vivement à tous les amoureux de la mer.",
      rating: 5,
      visible: true,
    },
    {
      userName: "Yassine R.",
      comment:
        "La cabane sur l'eau est incroyable ! Vue imprenable et service impeccable.",
      rating: 5,
      visible: true,
    },
    {
      userName: "Emma D.",
      comment:
        "Le couscous au poisson est le meilleur que j'ai goûté en Tunisie. Bravo au chef !",
      rating: 5,
      visible: true,
    },
    {
      userName: "Mohamed A.",
      comment:
        "Très bon rapport qualité-prix. L'accès en bateau rend l'expérience unique.",
      rating: 4,
      visible: true,
    },
    {
      userName: "Nadia F.",
      comment: "Ambiance calme et reposante. On se sent vraiment loin de tout.",
      rating: 5,
      visible: true,
    },
    {
      userName: "Thomas P.",
      comment:
        "Super endroit mais un peu cher pour les boissons. La vue compense tout.",
      rating: 3,
      visible: true,
    },
    {
      userName: "Ines M.",
      comment: "J'attends un meilleur traitement des clients.",
      rating: 2,
      visible: false,
    },
    {
      userName: "Guest_anon",
      comment: "pas terrible",
      rating: 1,
      visible: false,
    },
  ];

  reviews.push(
    ...Array.from({ length: 48 }, (_, index) => ({
      userName: `Guest ${index + 1}`,
      comment: `Retour ${index + 1} pour verifier le rendu du site avec beaucoup d'avis, plusieurs longueurs de texte et des notes variees selon les periodes d'affluence.`,
      rating: 3 + (index % 3),
      visible: index % 6 !== 0,
    })),
    ...Array.from({ length: 12 }, (_, index) => ({
      userName: `Pending ${index + 1}`,
      comment: `Avis en attente ${index + 1} pour tester la moderation et les statistiques persistees.`,
      rating: (index % 5) + 1,
      visible: false,
    })),
  );

  await prisma.review.createMany({ data: reviews });

  console.log("Seed complete");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
