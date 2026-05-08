import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.admin.upsert({
    where: { email: "chedi.lahmer47@gmail.com" },
    update: {},
    create: { email: "chedi.lahmer47@gmail.com", password: hashedPassword },
  });

  const defaults = {
    name: "Ilot Coco Beach",
    phone: "+216 99 123 456",
    whatsapp: "21699123456",
    email: "contact@ilotcocobeach.com",
    instagram: "https://www.instagram.com/ilotcocobeach",
    messenger: "https://m.me/ilotcocobeach",
    facebook: "https://www.facebook.com/IlotCocoBeach",
    address: "Ghar El Melh, Bizerte, Tunisie",
    hours: "Tous les jours 10h - 00h",
    lat: "37.1476125",
    lng: "10.2133906",
  };

  for (const [key, value] of Object.entries(defaults)) {
    await prisma.siteConfig.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }

  // Menu categories + items
  const categories = [
    {
      name: { fr: "Entrees", en: "Starters", ar: "مقبلات" },
      order: 1,
      items: [
        {
          name: {
            fr: "Salade Mediterraneenne",
            en: "Mediterranean Salad",
            ar: "سلطة متوسطية",
          },
          description: {
            fr: "Tomates, concombres, olives, feta et huile d'olive",
            en: "Tomatoes, cucumbers, olives, feta and olive oil",
            ar: "طماطم، خيار، زيتون، فيتا",
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
            fr: "Poivrons et tomates grilles, ail, huile d'olive",
            en: "Grilled peppers and tomatoes, garlic, olive oil",
            ar: "فلفل وطماطم مشوية",
          },
          priceStandard: 10,
          priceExtra: 15,
          available: true,
          order: 2,
        },
        {
          name: { fr: "Brick au thon", en: "Tuna Brick", ar: "بريك بالتونة" },
          description: {
            fr: "Pate croustillante farcie au thon et oeuf",
            en: "Crispy pastry stuffed with tuna and egg",
            ar: "عجينة مقرمشة بالتونة",
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
            fr: "Tomates epicees, poivrons, crevettes et oeuf poches",
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
            fr: "Houmous, baba ghanoush, tabboule et pain pita",
            en: "Hummus, baba ghanoush, tabbouleh and pita bread",
            ar: "حمص، بابا غنوج، تبولة وخبز",
          },
          priceStandard: 16,
          priceExtra: 22,
          available: true,
          order: 5,
        },
        {
          name: { fr: "Soupe de Poissons", en: "Fish Soup", ar: "شوربة سمك" },
          description: {
            fr: "Bouillon parfume de poissons frais, croutons et rouille",
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
            fr: "Thon rouge frais coupe au couteau, avocat et sesame",
            en: "Fresh red tuna hand-cut, avocado and sesame",
            ar: "تونة حمراء طازجة، أفوكادو وسمسم",
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
            fr: "Calamars panees et frits, sauce tartare maison",
            en: "Breaded and fried calamari, homemade tartar sauce",
            ar: "كالاماري مقلي مع صلصة تارتار",
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
            fr: "Daurade Grillee",
            en: "Grilled Sea Bream",
            ar: "سمك الدوراد المشوي",
          },
          description: {
            fr: "Daurade fraiche grillee au charbon avec legumes de saison",
            en: "Fresh charcoal-grilled sea bream with seasonal vegetables",
            ar: "دوراد طازج مشوي على الفحم",
          },
          priceStandard: 35,
          priceExtra: 48,
          available: true,
          order: 1,
        },
        {
          name: { fr: "Loup de Mer", en: "Sea Bass", ar: "قاروص" },
          description: {
            fr: "Filet de loup grille, sauce citron et capres",
            en: "Grilled sea bass fillet, lemon caper sauce",
            ar: "فيليه قاروص مشوي",
          },
          priceStandard: 40,
          priceExtra: 55,
          available: true,
          order: 2,
        },
        {
          name: {
            fr: "Crevettes Flambees",
            en: "Flambeed Shrimp",
            ar: "قمبري مشعل",
          },
          description: {
            fr: "Crevettes royales flambees au pastis, riz parfume",
            en: "Royal shrimp flambeed with pastis, fragrant rice",
            ar: "قمبري ملكي مشعل",
          },
          priceStandard: 45,
          priceExtra: 60,
          available: true,
          order: 3,
        },
        {
          name: {
            fr: "Poulpe Grille",
            en: "Grilled Octopus",
            ar: "أخطبوط مشوي",
          },
          description: {
            fr: "Poulpe tendre grille, pommes de terre et herbes",
            en: "Tender grilled octopus, potatoes and herbs",
            ar: "أخطبوط طري مشوي",
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
            fr: "Couscous traditionnel aux poissons varies et legumes",
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
            fr: "Riz safranne aux crevettes, moules et calamars",
            en: "Saffron rice with shrimp, mussels and calamari",
            ar: "أرز بالزعفران مع قمبري وبلح البحر",
          },
          priceStandard: 42,
          priceExtra: 58,
          available: true,
          order: 6,
        },
        {
          name: {
            fr: "Tajine de Merou",
            en: "Grouper Tagine",
            ar: "طاجين الميرو",
          },
          description: {
            fr: "Merou mijote aux olives, citron confit et herbes fraiches",
            en: "Grouper braised with olives, preserved lemon and fresh herbs",
            ar: "ميرو مطبوخ بالزيتون والليمون المخلل",
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
            fr: "Risotto cremeux aux crevettes, moules et parmesan",
            en: "Creamy risotto with shrimp, mussels and parmesan",
            ar: "ريزوتو كريمي بالقمبري وبلح البحر",
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
            ar: "تشكيلة فواكه طازجة",
          },
          priceStandard: 8,
          priceExtra: 12,
          available: true,
          order: 1,
        },
        {
          name: {
            fr: "Creme Brulee Coco",
            en: "Coconut Creme Brulee",
            ar: "كريم بروليه جوز الهند",
          },
          description: {
            fr: "Creme brulee parfumee a la noix de coco",
            en: "Coconut-flavored creme brulee",
            ar: "كريم بروليه بجوز الهند",
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
            fr: "Coeur coulant au chocolat noir, glace vanille",
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
            fr: "Tiramisu a la Datte",
            en: "Date Tiramisu",
            ar: "تيراميسو بالتمر",
          },
          description: {
            fr: "Tiramisu revisite aux dattes tunisiennes et cafe",
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
            fr: "Panna cotta onctueuse au coulis de mangue fraiche",
            en: "Smooth panna cotta with fresh mango coulis",
            ar: "بانا كوتا ناعمة مع صلصة المانجو",
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
            fr: "Feuillete croustillant aux amandes, pistaches et miel",
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
            fr: "Sorbet rafraichissant au citron et basilic frais",
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
            ar: "مانجو، أناناس، فاكهة العاطفة",
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
            fr: "Citron frais presse, menthe et miel",
            en: "Fresh pressed lemon, mint and honey",
            ar: "ليمون طازج، نعناع وعسل",
          },
          priceStandard: 7,
          priceExtra: 10,
          available: true,
          order: 3,
        },
        {
          name: { fr: "The a la Menthe", en: "Mint Tea", ar: "شاي بالنعناع" },
          description: {
            fr: "The vert infuse a la menthe fraiche et pignons de pin",
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
            fr: "Jus d'Orange Presse",
            en: "Fresh Orange Juice",
            ar: "عصير برتقال طازج",
          },
          description: {
            fr: "Oranges fraiches pressees a la minute",
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
            fr: "Citron vert, menthe fraiche, eau gazeuse et sucre de canne",
            en: "Lime, fresh mint, sparkling water and cane sugar",
            ar: "ليمون أخضر، نعناع طازج، ماء غازي",
          },
          priceStandard: 9,
          priceExtra: 13,
          available: true,
          order: 6,
        },
        {
          name: {
            fr: "Cafe Glace Coco",
            en: "Iced Coconut Coffee",
            ar: "قهوة مثلجة بجوز الهند",
          },
          description: {
            fr: "Cafe froid, lait de coco, glace pilee et caramel",
            en: "Cold coffee, coconut milk, crushed ice and caramel",
            ar: "قهوة باردة، حليب جوز الهند، ثلج مجروش",
          },
          priceStandard: 11,
          priceExtra: 15,
          available: true,
          order: 7,
        },
        {
          name: {
            fr: "Eau de Coco Fraiche",
            en: "Fresh Coconut Water",
            ar: "ماء جوز الهند الطازج",
          },
          description: {
            fr: "Eau de coco naturelle servie dans la noix",
            en: "Natural coconut water served in the shell",
            ar: "ماء جوز الهند الطبيعي",
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
            fr: "Crevettes marines grillees au feu de bois, sauce chermoula",
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
            fr: "Cote d'Agneau Grillee",
            en: "Grilled Lamb Chops",
            ar: "ريش الغنم المشوية",
          },
          description: {
            fr: "Cotes d'agneau marines aux herbes, grillees a la perfection",
            en: "Herb-marinated lamb chops, grilled to perfection",
            ar: "ريش غنم متبلة بالأعشاب ومشوية",
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
            fr: "Assortiment de viandes et poissons grilles au charbon",
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
            fr: "Poulet Grille aux Epices",
            en: "Spiced Grilled Chicken",
            ar: "دجاج مشوي بالتوابل",
          },
          description: {
            fr: "Demi-poulet marine aux epices tunisiennes, grille lentement",
            en: "Half chicken marinated in Tunisian spices, slow-grilled",
            ar: "نصف دجاجة متبلة بالتوابل التونسية",
          },
          priceStandard: 25,
          priceExtra: 35,
          available: true,
          order: 4,
        },
        {
          name: {
            fr: "Entrecote de Boeuf",
            en: "Beef Rib-Eye",
            ar: "أنتركوت بقر",
          },
          description: {
            fr: "Entrecote de boeuf grillee, beurre aux herbes",
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
            fr: "Saucisses merguez faites maison, grillees au charbon",
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
            fr: "Selection de viandes et fruits de mer grilles pour 2 personnes",
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
            fr: "Frites croustillantes coupees a la main",
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
            fr: "Riz Parfume au Safran",
            en: "Saffron Rice",
            ar: "أرز بالزعفران",
          },
          description: {
            fr: "Riz basmati cuit au safran et amandes grillees",
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
            fr: "Legumes Grilles",
            en: "Grilled Vegetables",
            ar: "خضار مشوية",
          },
          description: {
            fr: "Courgettes, poivrons, aubergines grilles a l'huile d'olive",
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
            fr: "Puree de Patate Douce",
            en: "Sweet Potato Mash",
            ar: "بوريه البطاطا الحلوة",
          },
          description: {
            fr: "Puree onctueuse de patate douce au beurre",
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
            fr: "Pain traditionnel tunisien cuit au four a bois",
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

  // Spaces
  const spaces = [
    {
      name: {
        fr: "Cabane sur l'eau",
        en: "Overwater Cabin",
        ar: "كوخ على الماء",
      },
      description: {
        fr: "Table privee au-dessus des eaux turquoise, avec hamac et vue panoramique sur la mer.",
        en: "Private table above turquoise waters, with hammock and panoramic sea view.",
        ar: "طاولة خاصة فوق المياه الفيروزية مع أرجوحة",
      },
      price: 80,
      capacity: 6,
      order: 1,
    },
    {
      name: { fr: "Cabane sur sable", en: "Beach Cabin", ar: "كوخ على الرمل" },
      description: {
        fr: "Pergola couverte avec table en bois, coussins colores et rideaux. Pieds dans le sable.",
        en: "Covered pergola with wooden table, colorful cushions and curtains. Feet in the sand.",
        ar: "عريشة مغطاة بطاولة خشبية ووسائد",
      },
      price: 60,
      capacity: 8,
      order: 2,
    },
    {
      name: {
        fr: "Espace Detente",
        en: "Relaxation Zone",
        ar: "منطقة الاسترخاء",
      },
      description: {
        fr: "Hamacs colores et bean bags entre les pergolas. L'endroit ideal pour se relaxer.",
        en: "Colorful hammocks and bean bags between pergolas. The perfect spot to relax.",
        ar: "أراجيح ملونة وبين باغز بين العرائش",
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
        fr: "Aventure en bateau autour de l'ile. Decouvrez les criques cachees et les eaux cristallines.",
        en: "Boat adventure around the island. Discover hidden coves and crystal-clear waters.",
        ar: "مغامرة بالقارب حول الجزيرة",
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
        fr: "Terrasse surelevee offrant une vue a 360 degres sur la mer et l'ile. Parfait pour les groupes.",
        en: "Elevated terrace offering a 360-degree view of the sea and island. Perfect for groups.",
        ar: "شرفة مرتفعة بإطلالة 360 درجة على البحر والجزيرة",
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
        fr: "Table intime pour deux decoree de lanternes et voilages, face au coucher du soleil.",
        en: "Intimate table for two decorated with lanterns and drapes, facing the sunset.",
        ar: "طاولة حميمة لشخصين مزينة بالفوانيس مقابل الغروب",
      },
      price: 100,
      capacity: 2,
      order: 6,
    },
    {
      name: { fr: "Zone VIP", en: "VIP Zone", ar: "المنطقة المميزة" },
      description: {
        fr: "Espace exclusif avec service premium, canapes en rotin et bar prive. Reservation obligatoire.",
        en: "Exclusive space with premium service, rattan sofas and private bar. Reservation required.",
        ar: "مساحة حصرية بخدمة متميزة وأرائك وبار خاص",
      },
      price: 120,
      capacity: 12,
      order: 7,
    },
    {
      name: { fr: "Espace Famille", en: "Family Area", ar: "مساحة العائلة" },
      description: {
        fr: "Grande zone amenagee pour les familles avec aire de jeux pour enfants et tables spacieuses.",
        en: "Large area designed for families with a children's play zone and spacious tables.",
        ar: "منطقة كبيرة مهيأة للعائلات مع ألعاب أطفال وطاولات واسعة",
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
        fr: "Cabane privee decoree avec des fleurs et bougies. Ideal pour les couples en voyage de noces.",
        en: "Private cabin decorated with flowers and candles. Ideal for couples on honeymoon.",
        ar: "كوخ خاص مزين بالورود والشموع، مثالي لشهر العسل",
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
        fr: "Emplacement premium sur la pointe ouest de l'ile pour admirer les plus beaux couchers de soleil.",
        en: "Premium spot on the western tip of the island to admire the most beautiful sunsets.",
        ar: "موقع مميز على الطرف الغربي للجزيرة لمشاهدة أجمل الغروب",
      },
      price: 85,
      capacity: 6,
      order: 10,
    },
  ];

  for (const space of spaces) {
    await prisma.space.create({ data: space });
  }

  // Flash sales
  const now = Date.now();
  const flashSales = [
    {
      title: {
        fr: "Offre Speciale Ete !",
        en: "Special Summer Offer!",
        ar: "عرض الصيف الخاص!",
      },
      description: {
        fr: "Reservez une cabane sur l'eau et recevez un cocktail tropical offert pour chaque personne !",
        en: "Book an overwater cabin and receive a free tropical cocktail for each person!",
        ar: "احجز كوخ على الماء واحصل على كوكتيل مجاني",
      },
      discountPercent: 25,
      endsAt: new Date(now + 3 * 86400000 + 5 * 3600000),
    },
    {
      title: {
        fr: "Menu Degustation -30%",
        en: "Tasting Menu -30%",
        ar: "قائمة التذوق -30%",
      },
      description: {
        fr: "Profitez de notre menu degustation complet a prix reduit : entree, plat, dessert et boisson inclus !",
        en: "Enjoy our full tasting menu at a reduced price: starter, main, dessert and drink included!",
        ar: "استمتع بقائمة التذوق الكاملة بسعر مخفض!",
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
        fr: "Venez a 6 ou plus et beneficiez de 15% de reduction sur l'ensemble de votre reservation !",
        en: "Come as a group of 6 or more and get 15% off your entire booking!",
        ar: "احضروا كمجموعة من 6 أشخاص أو أكثر!",
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
        fr: "Tous les cocktails a moitie prix de 16h a 18h !",
        en: "All cocktails half price from 4pm to 6pm!",
        ar: "جميع الكوكتيلات بنصف السعر!",
      },
      discountPercent: 50,
      endsAt: new Date(now + 2 * 86400000 + 6 * 3600000),
    },
    {
      title: {
        fr: "Soiree Romantique -20%",
        en: "Romantic Evening -20%",
        ar: "سهرة رومانسية -20%",
      },
      description: {
        fr: "Reservez le Coin Romantique et beneficiez de 20% sur le diner complet pour deux personnes.",
        en: "Book the Romantic Corner and get 20% off a complete dinner for two.",
        ar: "احجز الزاوية الرومانسية واحصل على خصم 20%.",
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
        fr: "Le Plateau Royal Grillades pour 2 personnes avec une reduction exceptionnelle de 35% !",
        en: "The Royal Grill Platter for 2 with an exceptional 35% discount!",
        ar: "طبق المشويات الملكي لشخصين بخصم 35%!",
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
        fr: "Acces Zone VIP avec service premium a -40%. Bar prive et canapes en rotin inclus.",
        en: "VIP Zone access with premium service at -40%. Private bar and rattan sofas included.",
        ar: "دخول المنطقة المميزة بخصم 40%.",
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
        fr: "Brunch illimite face a la mer chaque dimanche.",
        en: "Unlimited brunch by the sea every Sunday.",
        ar: "فطور غير محدود أمام البحر كل يوم أحد.",
      },
      discountPercent: 25,
      endsAt: new Date(now + 10 * 86400000 + 1 * 3600000),
    },
  ];

  for (const sale of flashSales) {
    await prisma.flashSale.create({ data: sale });
  }

  // Vouchers
  const voucherData = [
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

  for (const v of voucherData) {
    await prisma.voucher.create({ data: v });
  }

  // Reviews
  const existingReviews = await prisma.review.count();
  if (existingReviews === 0) {
    await prisma.review.createMany({
      data: [
        {
          userName: "Sophie M.",
          comment:
            "Endroit magnifique, personnel très accueillant. On y retourne cet été !",
          rating: 5,
        },
        {
          userName: "Ahmed K.",
          comment:
            "Belle plage, bonne cuisine. Le service pourrait être un peu plus rapide.",
          rating: 4,
        },
        {
          userName: "Marie L.",
          comment:
            "Parfait pour une journée en famille. Les enfants ont adoré !",
          rating: 5,
        },
        {
          userName: "Karim B.",
          comment: "Cadre paradisiaque. Les cocktails sont excellents.",
          rating: 4,
        },
        {
          userName: "Laura T.",
          comment: "Un vrai petit coin de paradis. Je recommande vivement.",
          rating: 5,
        },
      ],
    });
  }

  console.log("Seed complete");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
