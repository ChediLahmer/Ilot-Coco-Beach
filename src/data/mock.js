import overwaterImg from '@/assets/images/overwater-cabin.jpg'
import waterSwingImg from '@/assets/images/water-swing.jpg'
import hammockImg from '@/assets/images/hammock-area.jpg'
import cabinImg from '@/assets/images/cabin-interior.jpg'
import cabinHammockImg from '@/assets/images/cabin-hammock.jpg'
import surfboardImg from '@/assets/images/surfboard-sign.jpg'
import swingImg from '@/assets/images/swing-pergola.jpg'
import heroImg from '@/assets/images/hero-beach-lounge.jpg'

export const menuCategories = [
  {
    id: 1,
    name: { fr: 'Entrees', en: 'Starters', ar: 'مقبلات' },
    items: [
      { id: 1, name: { fr: 'Salade Mediterraneenne', en: 'Mediterranean Salad', ar: 'سلطة متوسطية' }, desc: { fr: 'Tomates, concombres, olives, feta et huile d\'olive', en: 'Tomatoes, cucumbers, olives, feta and olive oil', ar: 'طماطم، خيار، زيتون، فيتا' }, priceStandard: 12, priceExtra: 18, image: heroImg, available: true },
      { id: 2, name: { fr: 'Salade Mechouia', en: 'Mechouia Salad', ar: 'سلطة مشوية' }, desc: { fr: 'Poivrons et tomates grilles, ail, huile d\'olive', en: 'Grilled peppers and tomatoes, garlic, olive oil', ar: 'فلفل وطماطم مشوية' }, priceStandard: 10, priceExtra: 15, image: cabinImg, available: true },
      { id: 3, name: { fr: 'Brick au thon', en: 'Tuna Brick', ar: 'بريك بالتونة' }, desc: { fr: 'Pate croustillante farcie au thon et oeuf', en: 'Crispy pastry stuffed with tuna and egg', ar: 'عجينة مقرمشة بالتونة' }, priceStandard: 8, priceExtra: 12, image: null, available: true },
      { id: 13, name: { fr: 'Ojja aux Crevettes', en: 'Shrimp Ojja', ar: 'عجة بالقمبري' }, desc: { fr: 'Tomates epiceees, poivrons, crevettes et oeuf poches', en: 'Spiced tomatoes, peppers, shrimp and poached eggs', ar: 'طماطم حارة، فلفل، قمبري وبيض' }, priceStandard: 14, priceExtra: 20, image: overwaterImg, available: true },
      { id: 14, name: { fr: 'Assortiment de Mezze', en: 'Mezze Platter', ar: 'تشكيلة مزة' }, desc: { fr: 'Houmous, baba ghanoush, tabboule et pain pita', en: 'Hummus, baba ghanoush, tabbouleh and pita bread', ar: 'حمص، بابا غنوج، تبولة وخبز' }, priceStandard: 16, priceExtra: 22, image: null, available: true },
      { id: 15, name: { fr: 'Soupe de Poissons', en: 'Fish Soup', ar: 'شوربة سمك' }, desc: { fr: 'Bouillon parfume de poissons frais, croûtons et rouille', en: 'Fragrant fresh fish broth, croutons and rouille', ar: 'مرق سمك طازج معطر مع خبز محمص' }, priceStandard: 11, priceExtra: 16, image: hammockImg, available: true },
      { id: 16, name: { fr: 'Tartare de Thon', en: 'Tuna Tartare', ar: 'تارتار التونة' }, desc: { fr: 'Thon rouge frais coupe au couteau, avocat et sesame', en: 'Fresh red tuna hand-cut, avocado and sesame', ar: 'تونة حمراء طازجة، أفوكادو وسمسم' }, priceStandard: 18, priceExtra: 25, image: waterSwingImg, available: true },
      { id: 17, name: { fr: 'Beignets de Calamars', en: 'Calamari Fritters', ar: 'بينيي الكالاماري' }, desc: { fr: 'Calamars panees et frits, sauce tartare maison', en: 'Breaded and fried calamari, homemade tartar sauce', ar: 'كالاماري مقلي مع صلصة تارتار' }, priceStandard: 13, priceExtra: 18, image: null, available: false },
    ]
  },
  {
    id: 2,
    name: { fr: 'Plats Principaux', en: 'Main Courses', ar: 'أطباق رئيسية' },
    items: [
      { id: 4, name: { fr: 'Daurade Grillee', en: 'Grilled Sea Bream', ar: 'سمك الدوراد المشوي' }, desc: { fr: 'Daurade fraiche grillee au charbon avec legumes de saison', en: 'Fresh charcoal-grilled sea bream with seasonal vegetables', ar: 'دوراد طازج مشوي على الفحم' }, priceStandard: 35, priceExtra: 48, image: overwaterImg, available: true },
      { id: 5, name: { fr: 'Loup de Mer', en: 'Sea Bass', ar: 'قاروص' }, desc: { fr: 'Filet de loup grille, sauce citron et capres', en: 'Grilled sea bass fillet, lemon caper sauce', ar: 'فيليه قاروص مشوي' }, priceStandard: 40, priceExtra: 55, image: null, available: true },
      { id: 6, name: { fr: 'Crevettes Flambees', en: 'Flambeed Shrimp', ar: 'قمبري مشعل' }, desc: { fr: 'Crevettes royales flambees au pastis, riz parfume', en: 'Royal shrimp flambeed with pastis, fragrant rice', ar: 'قمبري ملكي مشعل' }, priceStandard: 45, priceExtra: 60, image: hammockImg, available: true },
      { id: 7, name: { fr: 'Poulpe Grille', en: 'Grilled Octopus', ar: 'أخطبوط مشوي' }, desc: { fr: 'Poulpe tendre grille, pommes de terre et herbes', en: 'Tender grilled octopus, potatoes and herbs', ar: 'أخطبوط طري مشوي' }, priceStandard: 38, priceExtra: 50, image: null, available: false },
      { id: 18, name: { fr: 'Couscous au Poisson', en: 'Fish Couscous', ar: 'كسكس بالسمك' }, desc: { fr: 'Couscous traditionnel aux poissons varies et legumes', en: 'Traditional couscous with mixed fish and vegetables', ar: 'كسكس تقليدي بالسمك والخضر' }, priceStandard: 32, priceExtra: 45, image: cabinImg, available: true },
      { id: 19, name: { fr: 'Paella Fruits de Mer', en: 'Seafood Paella', ar: 'باييلا بثمار البحر' }, desc: { fr: 'Riz safranne aux crevettes, moules et calamars', en: 'Saffron rice with shrimp, mussels and calamari', ar: 'أرز بالزعفران مع قمبري وبلح البحر' }, priceStandard: 42, priceExtra: 58, image: surfboardImg, available: true },
      { id: 20, name: { fr: 'Tajine de Merou', en: 'Grouper Tagine', ar: 'طاجين الميرو' }, desc: { fr: 'Merou mijote aux olives, citron confit et herbes fraiches', en: 'Grouper braised with olives, preserved lemon and fresh herbs', ar: 'ميرو مطبوخ بالزيتون والليمون المخلل' }, priceStandard: 36, priceExtra: 50, image: swingImg, available: true },
      { id: 21, name: { fr: 'Risotto aux Fruits de Mer', en: 'Seafood Risotto', ar: 'ريزوتو بثمار البحر' }, desc: { fr: 'Risotto cremeux aux crevettes, moules et parmesan', en: 'Creamy risotto with shrimp, mussels and parmesan', ar: 'ريزوتو كريمي بالقمبري وبلح البحر' }, priceStandard: 34, priceExtra: 48, image: null, available: true },
    ]
  },
  {
    id: 3,
    name: { fr: 'Desserts', en: 'Desserts', ar: 'حلويات' },
    items: [
      { id: 8, name: { fr: 'Fruits de Saison', en: 'Seasonal Fruits', ar: 'فواكه الموسم' }, desc: { fr: 'Assortiment de fruits frais de saison', en: 'Assortment of fresh seasonal fruits', ar: 'تشكيلة فواكه طازجة' }, priceStandard: 8, priceExtra: 12, image: null, available: true },
      { id: 9, name: { fr: 'Creme Brulee Coco', en: 'Coconut Creme Brulee', ar: 'كريم بروليه جوز الهند' }, desc: { fr: 'Creme brulee parfumee a la noix de coco', en: 'Coconut-flavored creme brulee', ar: 'كريم بروليه بجوز الهند' }, priceStandard: 10, priceExtra: 14, image: null, available: true },
      { id: 22, name: { fr: 'Fondant au Chocolat', en: 'Chocolate Fondant', ar: 'فوندون الشوكولاتة' }, desc: { fr: 'Coeur coulant au chocolat noir, glace vanille', en: 'Dark chocolate molten cake, vanilla ice cream', ar: 'كعكة شوكولاتة سائلة مع آيس كريم فانيلا' }, priceStandard: 12, priceExtra: 16, image: cabinHammockImg, available: true },
      { id: 23, name: { fr: 'Tiramisu a la Datte', en: 'Date Tiramisu', ar: 'تيراميسو بالتمر' }, desc: { fr: 'Tiramisu revisite aux dattes tunisiennes et cafe', en: 'Tiramisu revisited with Tunisian dates and coffee', ar: 'تيراميسو بالتمر التونسي والقهوة' }, priceStandard: 11, priceExtra: 15, image: null, available: true },
      { id: 24, name: { fr: 'Panna Cotta Mangue', en: 'Mango Panna Cotta', ar: 'بانا كوتا بالمانجو' }, desc: { fr: 'Panna cotta onctueuse au coulis de mangue fraiche', en: 'Smooth panna cotta with fresh mango coulis', ar: 'بانا كوتا ناعمة مع صلصة المانجو' }, priceStandard: 10, priceExtra: 14, image: heroImg, available: true },
      { id: 25, name: { fr: 'Baklawa Maison', en: 'Homemade Baklava', ar: 'بقلاوة منزلية' }, desc: { fr: 'Feuillete croustillant aux amandes, pistaches et miel', en: 'Crispy pastry with almonds, pistachios and honey', ar: 'فطيرة مقرمشة باللوز والفستق والعسل' }, priceStandard: 9, priceExtra: 13, image: null, available: true },
      { id: 26, name: { fr: 'Sorbet Citron Basilic', en: 'Lemon Basil Sorbet', ar: 'سوربيه ليمون وريحان' }, desc: { fr: 'Sorbet rafraichissant au citron et basilic frais', en: 'Refreshing sorbet with lemon and fresh basil', ar: 'سوربيه منعش بالليمون والريحان الطازج' }, priceStandard: 7, priceExtra: 10, image: null, available: true },
    ]
  },
  {
    id: 4,
    name: { fr: 'Boissons', en: 'Drinks', ar: 'مشروبات' },
    items: [
      { id: 10, name: { fr: 'Cocktail Tropical', en: 'Tropical Cocktail', ar: 'كوكتيل استوائي' }, desc: { fr: 'Mangue, ananas, fruit de la passion', en: 'Mango, pineapple, passion fruit', ar: 'مانجو، أناناس، فاكهة العاطفة' }, priceStandard: 12, priceExtra: 18, image: null, available: true },
      { id: 11, name: { fr: 'Smoothie Coco Beach', en: 'Coco Beach Smoothie', ar: 'سموثي كوكو بيتش' }, desc: { fr: 'Noix de coco, banane, lait d\'amande', en: 'Coconut, banana, almond milk', ar: 'جوز الهند، موز، حليب اللوز' }, priceStandard: 10, priceExtra: 14, image: null, available: true },
      { id: 12, name: { fr: 'Citronnade Maison', en: 'Homemade Lemonade', ar: 'عصير ليمون منزلي' }, desc: { fr: 'Citron frais presse, menthe et miel', en: 'Fresh pressed lemon, mint and honey', ar: 'ليمون طازج، نعناع وعسل' }, priceStandard: 7, priceExtra: 10, image: null, available: true },
      { id: 27, name: { fr: 'The a la Menthe', en: 'Mint Tea', ar: 'شاي بالنعناع' }, desc: { fr: 'The vert infuse a la menthe fraiche et pignons de pin', en: 'Green tea infused with fresh mint and pine nuts', ar: 'شاي أخضر بالنعناع الطازج والصنوبر' }, priceStandard: 5, priceExtra: 8, image: waterSwingImg, available: true },
      { id: 28, name: { fr: 'Jus d\'Orange Presse', en: 'Fresh Orange Juice', ar: 'عصير برتقال طازج' }, desc: { fr: 'Oranges fraiches pressees a la minute', en: 'Freshly squeezed oranges on the spot', ar: 'برتقال طازج معصور في الحال' }, priceStandard: 6, priceExtra: 9, image: null, available: true },
      { id: 29, name: { fr: 'Mojito Vierge', en: 'Virgin Mojito', ar: 'موخيتو بدون كحول' }, desc: { fr: 'Citron vert, menthe fraiche, eau gazeuse et sucre de canne', en: 'Lime, fresh mint, sparkling water and cane sugar', ar: 'ليمون أخضر، نعناع طازج، ماء غازي' }, priceStandard: 9, priceExtra: 13, image: null, available: true },
      { id: 30, name: { fr: 'Cafe Glacé Coco', en: 'Iced Coconut Coffee', ar: 'قهوة مثلجة بجوز الهند' }, desc: { fr: 'Cafe froid, lait de coco, glace pilée et caramel', en: 'Cold coffee, coconut milk, crushed ice and caramel', ar: 'قهوة باردة، حليب جوز الهند، ثلج مجروش' }, priceStandard: 11, priceExtra: 15, image: swingImg, available: true },
      { id: 31, name: { fr: 'Eau de Coco Fraiche', en: 'Fresh Coconut Water', ar: 'ماء جوز الهند الطازج' }, desc: { fr: 'Eau de coco naturelle servie dans la noix', en: 'Natural coconut water served in the shell', ar: 'ماء جوز الهند الطبيعي' }, priceStandard: 8, priceExtra: 12, image: null, available: true },
    ]
  },
  {
    id: 5,
    name: { fr: 'Grillades', en: 'Grills', ar: 'مشويات' },
    items: [
      { id: 32, name: { fr: 'Brochettes de Crevettes', en: 'Shrimp Skewers', ar: 'أسياخ القمبري' }, desc: { fr: 'Crevettes marines grillees au feu de bois, sauce chermoula', en: 'Marinated shrimp grilled over wood fire, chermoula sauce', ar: 'قمبري متبل مشوي على الحطب مع صلصة الشرمولة' }, priceStandard: 28, priceExtra: 38, image: overwaterImg, available: true },
      { id: 33, name: { fr: 'Cote d\'Agneau Grillee', en: 'Grilled Lamb Chops', ar: 'ريش الغنم المشوية' }, desc: { fr: 'Cotes d\'agneau marines aux herbes, grillees a la perfection', en: 'Herb-marinated lamb chops, grilled to perfection', ar: 'ريش غنم متبلة بالأعشاب ومشوية' }, priceStandard: 38, priceExtra: 52, image: cabinImg, available: true },
      { id: 34, name: { fr: 'Brochettes Mixtes', en: 'Mixed Skewers', ar: 'أسياخ مشكلة' }, desc: { fr: 'Assortiment de viandes et poissons grilles au charbon', en: 'Assortment of charcoal-grilled meats and fish', ar: 'تشكيلة لحوم وأسماك مشوية على الفحم' }, priceStandard: 35, priceExtra: 48, image: null, available: true },
      { id: 35, name: { fr: 'Poulet Grille aux Epices', en: 'Spiced Grilled Chicken', ar: 'دجاج مشوي بالتوابل' }, desc: { fr: 'Demi-poulet marine aux epices tunisiennes, grille lentement', en: 'Half chicken marinated in Tunisian spices, slow-grilled', ar: 'نصف دجاجة متبلة بالتوابل التونسية' }, priceStandard: 25, priceExtra: 35, image: surfboardImg, available: true },
      { id: 36, name: { fr: 'Entrecote de Boeuf', en: 'Beef Rib-Eye', ar: 'أنتركوت بقر' }, desc: { fr: 'Entrecote de boeuf grillée, beurre aux herbes', en: 'Grilled beef rib-eye, herb butter', ar: 'أنتركوت بقر مشوي مع زبدة الأعشاب' }, priceStandard: 42, priceExtra: 58, image: null, available: true },
      { id: 37, name: { fr: 'Merguez Maison', en: 'Homemade Merguez', ar: 'مرقاز منزلي' }, desc: { fr: 'Saucisses merguez faites maison, grillees au charbon', en: 'Homemade merguez sausages, charcoal-grilled', ar: 'مرقاز منزلي مشوي على الفحم' }, priceStandard: 18, priceExtra: 25, image: hammockImg, available: true },
      { id: 38, name: { fr: 'Plateau Royal Grillades', en: 'Royal Grill Platter', ar: 'طبق المشويات الملكي' }, desc: { fr: 'Selection de viandes et fruits de mer grilles pour 2 personnes', en: 'Selection of grilled meats and seafood for 2', ar: 'تشكيلة لحوم وثمار بحر مشوية لشخصين' }, priceStandard: 75, priceExtra: 95, image: heroImg, available: true },
    ]
  },
  {
    id: 6,
    name: { fr: 'Accompagnements', en: 'Sides', ar: 'مرافقات' },
    items: [
      { id: 39, name: { fr: 'Frites Maison', en: 'Homemade Fries', ar: 'بطاطا مقلية منزلية' }, desc: { fr: 'Frites croustillantes coupees a la main', en: 'Hand-cut crispy fries', ar: 'بطاطا مقلية مقرمشة مقطعة يدوياً' }, priceStandard: 6, priceExtra: 9, image: null, available: true },
      { id: 40, name: { fr: 'Riz Parfume au Safran', en: 'Saffron Rice', ar: 'أرز بالزعفران' }, desc: { fr: 'Riz basmati cuit au safran et amandes grillees', en: 'Basmati rice cooked with saffron and toasted almonds', ar: 'أرز بسمتي بالزعفران واللوز المحمص' }, priceStandard: 7, priceExtra: 10, image: cabinHammockImg, available: true },
      { id: 41, name: { fr: 'Legumes Grilles', en: 'Grilled Vegetables', ar: 'خضار مشوية' }, desc: { fr: 'Courgettes, poivrons, aubergines grilles a l\'huile d\'olive', en: 'Zucchini, peppers, eggplant grilled with olive oil', ar: 'كوسا، فلفل، باذنجان مشوي بزيت الزيتون' }, priceStandard: 8, priceExtra: 12, image: null, available: true },
      { id: 42, name: { fr: 'Salade Verte', en: 'Green Salad', ar: 'سلطة خضراء' }, desc: { fr: 'Mesclun, roquette, vinaigrette balsamique', en: 'Mixed greens, arugula, balsamic vinaigrette', ar: 'خضار ورقية، جرجير، صلصة بلسمية' }, priceStandard: 5, priceExtra: 8, image: waterSwingImg, available: true },
      { id: 43, name: { fr: 'Puree de Patate Douce', en: 'Sweet Potato Mash', ar: 'بوريه البطاطا الحلوة' }, desc: { fr: 'Puree onctueuse de patate douce au beurre', en: 'Smooth sweet potato mash with butter', ar: 'بوريه بطاطا حلوة ناعم بالزبدة' }, priceStandard: 7, priceExtra: 10, image: null, available: true },
      { id: 44, name: { fr: 'Pain Tabouna', en: 'Tabouna Bread', ar: 'خبز طابونة' }, desc: { fr: 'Pain traditionnel tunisien cuit au four a bois', en: 'Traditional Tunisian bread baked in wood oven', ar: 'خبز تونسي تقليدي مخبوز في فرن الحطب' }, priceStandard: 3, priceExtra: 5, image: null, available: true },
    ]
  }
]

export const emplacements = [
  { id: 1, name: { fr: 'Cabane sur l\'eau', en: 'Overwater Cabin', ar: 'كوخ على الماء' }, desc: { fr: 'Table privee au-dessus des eaux turquoise, avec hamac et vue panoramique sur la mer.', en: 'Private table above turquoise waters, with hammock and panoramic sea view.', ar: 'طاولة خاصة فوق المياه الفيروزية مع أرجوحة' }, price: 80, capacity: 6, image: overwaterImg },
  { id: 2, name: { fr: 'Cabane sur sable', en: 'Beach Cabin', ar: 'كوخ على الرمل' }, desc: { fr: 'Pergola couverte avec table en bois, coussins colores et rideaux. Pieds dans le sable.', en: 'Covered pergola with wooden table, colorful cushions and curtains. Feet in the sand.', ar: 'عريشة مغطاة بطاولة خشبية ووسائد' }, price: 60, capacity: 8, image: cabinImg },
  { id: 3, name: { fr: 'Espace Detente', en: 'Relaxation Zone', ar: 'منطقة الاسترخاء' }, desc: { fr: 'Hamacs colores et bean bags entre les pergolas. L\'endroit ideal pour se relaxer.', en: 'Colorful hammocks and bean bags between pergolas. The perfect spot to relax.', ar: 'أراجيح ملونة وبين باغز بين العرائش' }, price: 40, capacity: 4, image: hammockImg },
  { id: 4, name: { fr: 'Balade Pirate en Mer', en: 'Sea Pirate Ride', ar: 'جولة القراصنة في البحر' }, desc: { fr: 'Aventure en bateau autour de l\'ile. Decouvrez les criques cachees et les eaux cristallines.', en: 'Boat adventure around the island. Discover hidden coves and crystal-clear waters.', ar: 'مغامرة بالقارب حول الجزيرة' }, price: 50, capacity: 10, image: cabinHammockImg },
  { id: 5, name: { fr: 'Terrasse Panoramique', en: 'Panoramic Terrace', ar: 'الشرفة البانورامية' }, desc: { fr: 'Terrasse surélevée offrant une vue a 360 degres sur la mer et l\'ile. Parfait pour les groupes.', en: 'Elevated terrace offering a 360-degree view of the sea and island. Perfect for groups.', ar: 'شرفة مرتفعة بإطلالة 360 درجة على البحر والجزيرة' }, price: 90, capacity: 8, image: swingImg },
  { id: 6, name: { fr: 'Coin Romantique', en: 'Romantic Corner', ar: 'الزاوية الرومانسية' }, desc: { fr: 'Table intime pour deux decorée de lanternes et voilages, face au coucher du soleil.', en: 'Intimate table for two decorated with lanterns and drapes, facing the sunset.', ar: 'طاولة حميمة لشخصين مزينة بالفوانيس مقابل الغروب' }, price: 100, capacity: 2, image: waterSwingImg },
  { id: 7, name: { fr: 'Zone VIP', en: 'VIP Zone', ar: 'المنطقة المميزة' }, desc: { fr: 'Espace exclusif avec service premium, canapes en rotin et bar prive. Reservation obligatoire.', en: 'Exclusive space with premium service, rattan sofas and private bar. Reservation required.', ar: 'مساحة حصرية بخدمة متميزة وأرائك وبار خاص' }, price: 120, capacity: 12, image: surfboardImg },
  { id: 8, name: { fr: 'Espace Famille', en: 'Family Area', ar: 'مساحة العائلة' }, desc: { fr: 'Grande zone amenagee pour les familles avec aire de jeux pour enfants et tables spacieuses.', en: 'Large area designed for families with a children\'s play zone and spacious tables.', ar: 'منطقة كبيرة مهيأة للعائلات مع ألعاب أطفال وطاولات واسعة' }, price: 70, capacity: 15, image: heroImg },
  { id: 9, name: { fr: 'Cabane Lune de Miel', en: 'Honeymoon Cabin', ar: 'كوخ شهر العسل' }, desc: { fr: 'Cabane privee decorée avec des fleurs et bougies. Ideal pour les couples en voyage de noces.', en: 'Private cabin decorated with flowers and candles. Ideal for couples on honeymoon.', ar: 'كوخ خاص مزين بالورود والشموع، مثالي لشهر العسل' }, price: 110, capacity: 2, image: cabinImg },
  { id: 10, name: { fr: 'Spot Coucher de Soleil', en: 'Sunset Spot', ar: 'بقعة الغروب' }, desc: { fr: 'Emplacement premium sur la pointe ouest de l\'ile pour admirer les plus beaux couchers de soleil.', en: 'Premium spot on the western tip of the island to admire the most beautiful sunsets.', ar: 'موقع مميز على الطرف الغربي للجزيرة لمشاهدة أجمل الغروب' }, price: 85, capacity: 6, image: hammockImg },
]

export const vouchers = [
  { id: 1, code: 'ILOT2026', discountPercent: 15, validUntil: '2026-08-31', isActive: true },
  { id: 2, code: 'SUMMER20', discountPercent: 20, validUntil: '2026-07-15', isActive: true },
  { id: 3, code: 'FAMILY10', discountPercent: 10, validUntil: '2026-09-30', isActive: true },
  { id: 4, code: 'BEACH50', discountPercent: 50, validUntil: '2026-06-30', isActive: true },
  { id: 5, code: 'WEEKEND15', discountPercent: 15, validUntil: '2026-12-31', isActive: true },
  { id: 6, code: 'GROUP25', discountPercent: 25, validUntil: '2026-10-15', isActive: true },
  { id: 7, code: 'EARLYBIRD', discountPercent: 20, validUntil: '2026-04-30', isActive: false },
  { id: 8, code: 'HONEYMOON', discountPercent: 30, validUntil: '2026-11-30', isActive: true },
]

export const flashSales = [
  {
    id: 1,
    title: { fr: 'Offre Speciale Ete !', en: 'Special Summer Offer!', ar: 'عرض الصيف الخاص!' },
    description: { fr: 'Reservez une cabane sur l\'eau et recevez un cocktail tropical offert pour chaque personne !', en: 'Book an overwater cabin and receive a free tropical cocktail for each person!', ar: 'احجز كوخ على الماء واحصل على كوكتيل مجاني' },
    discountPercent: 25,
    endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(),
    image: overwaterImg,
    isActive: true,
  },
  {
    id: 2,
    title: { fr: 'Menu Degustation -30%', en: 'Tasting Menu -30%', ar: 'قائمة التذوق -30%' },
    description: { fr: 'Profitez de notre menu degustation complet a prix reduit : entree, plat, dessert et boisson inclus !', en: 'Enjoy our full tasting menu at a reduced price: starter, main, dessert and drink included!', ar: 'استمتع بقائمة التذوق الكاملة بسعر مخفض: مقبلات، طبق رئيسي، حلوى ومشروب!' },
    discountPercent: 30,
    endsAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
    image: heroImg,
    isActive: true,
  },
  {
    id: 3,
    title: { fr: 'Offre Groupe 6+', en: 'Group 6+ Offer', ar: 'عرض المجموعات 6+' },
    description: { fr: 'Venez a 6 ou plus et beneficiez de 15% de reduction sur l\'ensemble de votre reservation !', en: 'Come as a group of 6 or more and get 15% off your entire booking!', ar: 'احضروا كمجموعة من 6 أشخاص أو أكثر واحصلوا على خصم 15% على كامل الحجز!' },
    discountPercent: 15,
    endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
    image: cabinHammockImg,
    isActive: true,
  },
  {
    id: 4,
    title: { fr: 'Happy Hour Cocktails', en: 'Cocktail Happy Hour', ar: 'ساعة سعيدة للكوكتيلات' },
    description: { fr: 'Tous les cocktails a moitie prix de 16h a 18h ! Profitez du coucher de soleil avec vos boissons preferees.', en: 'All cocktails half price from 4pm to 6pm! Enjoy the sunset with your favorite drinks.', ar: 'جميع الكوكتيلات بنصف السعر من 4 إلى 6 مساءً!' },
    discountPercent: 50,
    endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
    image: waterSwingImg,
    isActive: true,
  },
  {
    id: 5,
    title: { fr: 'Soiree Romantique -20%', en: 'Romantic Evening -20%', ar: 'سهرة رومانسية -20%' },
    description: { fr: 'Reservez le Coin Romantique et beneficiez de 20% sur le diner complet pour deux personnes.', en: 'Book the Romantic Corner and get 20% off a complete dinner for two.', ar: 'احجز الزاوية الرومانسية واحصل على خصم 20% على عشاء كامل لشخصين.' },
    discountPercent: 20,
    endsAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    image: cabinImg,
    isActive: true,
  },
  {
    id: 6,
    title: { fr: 'Grillades Royales -35%', en: 'Royal Grill -35%', ar: 'المشويات الملكية -35%' },
    description: { fr: 'Le Plateau Royal Grillades pour 2 personnes avec une reduction exceptionnelle de 35% !', en: 'The Royal Grill Platter for 2 with an exceptional 35% discount!', ar: 'طبق المشويات الملكي لشخصين بخصم استثنائي 35%!' },
    discountPercent: 35,
    endsAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
    image: hammockImg,
    isActive: true,
  },
  {
    id: 7,
    title: { fr: 'Terrasse VIP -40%', en: 'VIP Terrace -40%', ar: 'شرفة VIP -40%' },
    description: { fr: 'Acces Zone VIP avec service premium a -40%. Bar prive et canapes en rotin inclus.', en: 'VIP Zone access with premium service at -40%. Private bar and rattan sofas included.', ar: 'دخول المنطقة المميزة بخدمة متميزة بخصم 40%. بار خاص وأرائك مشمولة.' },
    discountPercent: 40,
    endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString(),
    image: surfboardImg,
    isActive: true,
  },
  {
    id: 8,
    title: { fr: 'Brunch du Dimanche', en: 'Sunday Brunch', ar: 'فطور يوم الأحد' },
    description: { fr: 'Brunch illimite face a la mer chaque dimanche. Fruits de mer, patisseries et jus frais.', en: 'Unlimited brunch by the sea every Sunday. Seafood, pastries and fresh juices.', ar: 'فطور غير محدود أمام البحر كل يوم أحد. مأكولات بحرية ومعجنات وعصائر طازجة.' },
    discountPercent: 25,
    endsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString(),
    image: swingImg,
    isActive: true,
  },
]

export const reviews = [
  { id: 1, userName: 'Sami B.', rating: 5, comment: 'Un endroit magique ! Les cabanes sur l\'eau sont incroyables. On se croirait aux Maldives. Le personnel est tres accueillant.', date: '2026-02-14' },
  { id: 2, userName: 'Yasmine K.', rating: 5, comment: 'Journee parfaite en famille. Les enfants ont adore les hamacs et la balancoire. Le menu est delicieux, surtout la daurade grillee !', date: '2026-01-28' },
  { id: 3, userName: 'Mehdi T.', rating: 4, comment: 'Super ambiance, tres beau cadre. Le trajet en barque fait partie de l\'experience. Je recommande la cabane privee.', date: '2026-03-01' },
  { id: 4, userName: 'Nour A.', rating: 5, comment: 'Le meilleur spot de Bizerte sans aucun doute. Les photos ne rendent meme pas justice a la beaute du lieu. A refaire absolument !', date: '2026-02-20' },
  { id: 5, userName: 'Amine R.', rating: 4, comment: 'Tres belle decouverte. Les crevettes flambees sont exceptionnelles. Seul bemol : il faut reserver a l\'avance en haute saison.', date: '2026-03-10' },
  { id: 6, userName: 'Leila M.', rating: 5, comment: 'Le coucher de soleil depuis la terrasse panoramique est a couper le souffle. On a pris le menu degustation et tout etait parfait.', date: '2026-02-05' },
  { id: 7, userName: 'Karim H.', rating: 3, comment: 'Le cadre est magnifique mais l\'attente etait un peu longue pour les plats. La qualite de la nourriture rattrape le retard cependant.', date: '2026-01-15' },
  { id: 8, userName: 'Fatma Z.', rating: 5, comment: 'Nous avons fete notre anniversaire de mariage dans la cabane lune de miel. Decoration sublime, service impeccable. Merci pour ce moment inoubliable !', date: '2026-03-08' },
  { id: 9, userName: 'Raouf S.', rating: 4, comment: 'La balade en bateau pirate est une experience unique. Les enfants ont adore et les criques cachees sont magnifiques. Je recommande vivement.', date: '2026-02-25' },
  { id: 10, userName: 'Ines B.', rating: 3, comment: 'Bel endroit mais les prix sont un peu eleves pour certains plats. Le poulpe grille etait excellent par contre. Bonne ambiance generale.', date: '2026-01-30' },
  { id: 11, userName: 'Walid D.', rating: 5, comment: 'Deuxieme visite et toujours aussi impressionnant. Le couscous au poisson est le meilleur que j\'ai goute. Le personnel se souvient de nous !', date: '2026-03-12' },
  { id: 12, userName: 'Amira C.', rating: 4, comment: 'Zone VIP vraiment premium. Le bar prive et les canapes en rotin sont tres confortables. La paella aux fruits de mer etait genereuse et savoureuse.', date: '2026-02-18' },
]

export const allImages = {
  heroImg, overwaterImg, waterSwingImg, hammockImg, cabinImg, cabinHammockImg, surfboardImg, swingImg
}
