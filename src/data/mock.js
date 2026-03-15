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
    name: { fr: 'Entrees', en: 'Starters', ar: '\u0645\u0642\u0628\u0644\u0627\u062a' },
    items: [
      { id: 1, name: { fr: 'Salade Mediterraneenne', en: 'Mediterranean Salad', ar: '\u0633\u0644\u0637\u0629 \u0645\u062a\u0648\u0633\u0637\u064a\u0629' }, desc: { fr: 'Tomates, concombres, olives, feta et huile d\'olive', en: 'Tomatoes, cucumbers, olives, feta and olive oil', ar: '\u0637\u0645\u0627\u0637\u0645\u060c \u062e\u064a\u0627\u0631\u060c \u0632\u064a\u062a\u0648\u0646\u060c \u0641\u064a\u062a\u0627' }, priceStandard: 12, priceExtra: 18, image: heroImg, available: true },
      { id: 2, name: { fr: 'Salade Mechouia', en: 'Mechouia Salad', ar: '\u0633\u0644\u0637\u0629 \u0645\u0634\u0648\u064a\u0629' }, desc: { fr: 'Poivrons et tomates grilles, ail, huile d\'olive', en: 'Grilled peppers and tomatoes, garlic, olive oil', ar: '\u0641\u0644\u0641\u0644 \u0648\u0637\u0645\u0627\u0637\u0645 \u0645\u0634\u0648\u064a\u0629' }, priceStandard: 10, priceExtra: 15, image: cabinImg, available: true },
      { id: 3, name: { fr: 'Brick au thon', en: 'Tuna Brick', ar: '\u0628\u0631\u064a\u0643 \u0628\u0627\u0644\u062a\u0648\u0646\u0629' }, desc: { fr: 'Pate croustillante farcie au thon et oeuf', en: 'Crispy pastry stuffed with tuna and egg', ar: '\u0639\u062c\u064a\u0646\u0629 \u0645\u0642\u0631\u0645\u0634\u0629 \u0628\u0627\u0644\u062a\u0648\u0646\u0629' }, priceStandard: 8, priceExtra: 12, image: null, available: true },
    ]
  },
  {
    id: 2,
    name: { fr: 'Plats Principaux', en: 'Main Courses', ar: '\u0623\u0637\u0628\u0627\u0642 \u0631\u0626\u064a\u0633\u064a\u0629' },
    items: [
      { id: 4, name: { fr: 'Daurade Grillee', en: 'Grilled Sea Bream', ar: '\u0633\u0645\u0643 \u0627\u0644\u062f\u0648\u0631\u0627\u062f \u0627\u0644\u0645\u0634\u0648\u064a' }, desc: { fr: 'Daurade fraiche grillee au charbon avec legumes de saison', en: 'Fresh charcoal-grilled sea bream with seasonal vegetables', ar: '\u062f\u0648\u0631\u0627\u062f \u0637\u0627\u0632\u062c \u0645\u0634\u0648\u064a \u0639\u0644\u0649 \u0627\u0644\u0641\u062d\u0645' }, priceStandard: 35, priceExtra: 48, image: overwaterImg, available: true },
      { id: 5, name: { fr: 'Loup de Mer', en: 'Sea Bass', ar: '\u0642\u0627\u0631\u0648\u0635' }, desc: { fr: 'Filet de loup grille, sauce citron et capres', en: 'Grilled sea bass fillet, lemon caper sauce', ar: '\u0641\u064a\u0644\u064a\u0647 \u0642\u0627\u0631\u0648\u0635 \u0645\u0634\u0648\u064a' }, priceStandard: 40, priceExtra: 55, image: null, available: true },
      { id: 6, name: { fr: 'Crevettes Flambees', en: 'Flambeed Shrimp', ar: '\u0642\u0645\u0628\u0631\u064a \u0645\u0634\u0639\u0644' }, desc: { fr: 'Crevettes royales flambees au pastis, riz parfume', en: 'Royal shrimp flambeed with pastis, fragrant rice', ar: '\u0642\u0645\u0628\u0631\u064a \u0645\u0644\u0643\u064a \u0645\u0634\u0639\u0644' }, priceStandard: 45, priceExtra: 60, image: hammockImg, available: true },
      { id: 7, name: { fr: 'Poulpe Grille', en: 'Grilled Octopus', ar: '\u0623\u062e\u0637\u0628\u0648\u0637 \u0645\u0634\u0648\u064a' }, desc: { fr: 'Poulpe tendre grille, pommes de terre et herbes', en: 'Tender grilled octopus, potatoes and herbs', ar: '\u0623\u062e\u0637\u0628\u0648\u0637 \u0637\u0631\u064a \u0645\u0634\u0648\u064a' }, priceStandard: 38, priceExtra: 50, image: null, available: false },
    ]
  },
  {
    id: 3,
    name: { fr: 'Desserts', en: 'Desserts', ar: '\u062d\u0644\u0648\u064a\u0627\u062a' },
    items: [
      { id: 8, name: { fr: 'Fruits de Saison', en: 'Seasonal Fruits', ar: '\u0641\u0648\u0627\u0643\u0647 \u0627\u0644\u0645\u0648\u0633\u0645' }, desc: { fr: 'Assortiment de fruits frais de saison', en: 'Assortment of fresh seasonal fruits', ar: '\u062a\u0634\u0643\u064a\u0644\u0629 \u0641\u0648\u0627\u0643\u0647 \u0637\u0627\u0632\u062c\u0629' }, priceStandard: 8, priceExtra: 12, image: null, available: true },
      { id: 9, name: { fr: 'Creme Brulee Coco', en: 'Coconut Creme Brulee', ar: '\u0643\u0631\u064a\u0645 \u0628\u0631\u0648\u0644\u064a\u0647 \u062c\u0648\u0632 \u0627\u0644\u0647\u0646\u062f' }, desc: { fr: 'Creme brulee parfumee a la noix de coco', en: 'Coconut-flavored creme brulee', ar: '\u0643\u0631\u064a\u0645 \u0628\u0631\u0648\u0644\u064a\u0647 \u0628\u062c\u0648\u0632 \u0627\u0644\u0647\u0646\u062f' }, priceStandard: 10, priceExtra: 14, image: null, available: true },
    ]
  },
  {
    id: 4,
    name: { fr: 'Boissons', en: 'Drinks', ar: '\u0645\u0634\u0631\u0648\u0628\u0627\u062a' },
    items: [
      { id: 10, name: { fr: 'Cocktail Tropical', en: 'Tropical Cocktail', ar: '\u0643\u0648\u0643\u062a\u064a\u0644 \u0627\u0633\u062a\u0648\u0627\u0626\u064a' }, desc: { fr: 'Mangue, ananas, fruit de la passion', en: 'Mango, pineapple, passion fruit', ar: '\u0645\u0627\u0646\u062c\u0648\u060c \u0623\u0646\u0627\u0646\u0627\u0633\u060c \u0641\u0627\u0643\u0647\u0629 \u0627\u0644\u0639\u0627\u0637\u0641\u0629' }, priceStandard: 12, priceExtra: 18, image: null, available: true },
      { id: 11, name: { fr: 'Smoothie Coco Beach', en: 'Coco Beach Smoothie', ar: '\u0633\u0645\u0648\u062b\u064a \u0643\u0648\u0643\u0648 \u0628\u064a\u062a\u0634' }, desc: { fr: 'Noix de coco, banane, lait d\'amande', en: 'Coconut, banana, almond milk', ar: '\u062c\u0648\u0632 \u0627\u0644\u0647\u0646\u062f\u060c \u0645\u0648\u0632\u060c \u062d\u0644\u064a\u0628 \u0627\u0644\u0644\u0648\u0632' }, priceStandard: 10, priceExtra: 14, image: null, available: true },
      { id: 12, name: { fr: 'Citronnade Maison', en: 'Homemade Lemonade', ar: '\u0639\u0635\u064a\u0631 \u0644\u064a\u0645\u0648\u0646 \u0645\u0646\u0632\u0644\u064a' }, desc: { fr: 'Citron frais presse, menthe et miel', en: 'Fresh pressed lemon, mint and honey', ar: '\u0644\u064a\u0645\u0648\u0646 \u0637\u0627\u0632\u062c\u060c \u0646\u0639\u0646\u0627\u0639 \u0648\u0639\u0633\u0644' }, priceStandard: 7, priceExtra: 10, image: null, available: true },
    ]
  }
]

export const emplacements = [
  { id: 1, name: { fr: 'Cabane sur l\'eau', en: 'Overwater Cabin', ar: '\u0643\u0648\u062e \u0639\u0644\u0649 \u0627\u0644\u0645\u0627\u0621' }, desc: { fr: 'Table privee au-dessus des eaux turquoise, avec hamac et vue panoramique sur la mer.', en: 'Private table above turquoise waters, with hammock and panoramic sea view.', ar: '\u0637\u0627\u0648\u0644\u0629 \u062e\u0627\u0635\u0629 \u0641\u0648\u0642 \u0627\u0644\u0645\u064a\u0627\u0647 \u0627\u0644\u0641\u064a\u0631\u0648\u0632\u064a\u0629 \u0645\u0639 \u0623\u0631\u062c\u0648\u062d\u0629' }, price: 80, capacity: 6, image: overwaterImg },
  { id: 2, name: { fr: 'Cabane sur sable', en: 'Beach Cabin', ar: '\u0643\u0648\u062e \u0639\u0644\u0649 \u0627\u0644\u0631\u0645\u0644' }, desc: { fr: 'Pergola couverte avec table en bois, coussins colores et rideaux. Pieds dans le sable.', en: 'Covered pergola with wooden table, colorful cushions and curtains. Feet in the sand.', ar: '\u0639\u0631\u064a\u0634\u0629 \u0645\u063a\u0637\u0627\u0629 \u0628\u0637\u0627\u0648\u0644\u0629 \u062e\u0634\u0628\u064a\u0629 \u0648\u0648\u0633\u0627\u0626\u062f' }, price: 60, capacity: 8, image: cabinImg },
  { id: 3, name: { fr: 'Espace Detente', en: 'Relaxation Zone', ar: '\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0627\u0633\u062a\u0631\u062e\u0627\u0621' }, desc: { fr: 'Hamacs colores et bean bags entre les pergolas. L\'endroit ideal pour se relaxer.', en: 'Colorful hammocks and bean bags between pergolas. The perfect spot to relax.', ar: '\u0623\u0631\u0627\u062c\u064a\u062d \u0645\u0644\u0648\u0646\u0629 \u0648\u0628\u064a\u0646 \u0628\u0627\u063a\u0632 \u0628\u064a\u0646 \u0627\u0644\u0639\u0631\u0627\u0626\u0634' }, price: 40, capacity: 4, image: hammockImg },
  { id: 4, name: { fr: 'Balade Pirate en Mer', en: 'Sea Pirate Ride', ar: '\u062c\u0648\u0644\u0629 \u0627\u0644\u0642\u0631\u0627\u0635\u0646\u0629 \u0641\u064a \u0627\u0644\u0628\u062d\u0631' }, desc: { fr: 'Aventure en bateau autour de l\'ile. Decouvrez les criques cachees et les eaux cristallines.', en: 'Boat adventure around the island. Discover hidden coves and crystal-clear waters.', ar: '\u0645\u063a\u0627\u0645\u0631\u0629 \u0628\u0627\u0644\u0642\u0627\u0631\u0628 \u062d\u0648\u0644 \u0627\u0644\u062c\u0632\u064a\u0631\u0629' }, price: 50, capacity: 10, image: cabinHammockImg },
]

export const vouchers = [
  { id: 1, code: 'ILOT2026', discountPercent: 15, validUntil: '2026-08-31', isActive: true },
  { id: 2, code: 'SUMMER20', discountPercent: 20, validUntil: '2026-07-15', isActive: true },
  { id: 3, code: 'FAMILY10', discountPercent: 10, validUntil: '2026-09-30', isActive: true },
]

export const flashSale = {
  id: 1,
  title: { fr: 'Offre Speciale Ete !', en: 'Special Summer Offer!', ar: '\u0639\u0631\u0636 \u0627\u0644\u0635\u064a\u0641 \u0627\u0644\u062e\u0627\u0635!' },
  description: { fr: 'Reservez une cabane sur l\'eau et recevez un cocktail tropical offert pour chaque personne !', en: 'Book an overwater cabin and receive a free tropical cocktail for each person!', ar: '\u0627\u062d\u062c\u0632 \u0643\u0648\u062e \u0639\u0644\u0649 \u0627\u0644\u0645\u0627\u0621 \u0648\u0627\u062d\u0635\u0644 \u0639\u0644\u0649 \u0643\u0648\u0643\u062a\u064a\u0644 \u0645\u062c\u0627\u0646\u064a' },
  discountPercent: 25,
  endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(),
  image: overwaterImg,
  isActive: true,
}

export const reviews = [
  { id: 1, userName: 'Sami B.', rating: 5, comment: 'Un endroit magique ! Les cabanes sur l\'eau sont incroyables. On se croirait aux Maldives. Le personnel est tres accueillant.', date: '2026-02-14' },
  { id: 2, userName: 'Yasmine K.', rating: 5, comment: 'Journee parfaite en famille. Les enfants ont adore les hamacs et la balancoire. Le menu est delicieux, surtout la daurade grillee !', date: '2026-01-28' },
  { id: 3, userName: 'Mehdi T.', rating: 4, comment: 'Super ambiance, tres beau cadre. Le trajet en barque fait partie de l\'experience. Je recommande la cabane privee.', date: '2026-03-01' },
  { id: 4, userName: 'Nour A.', rating: 5, comment: 'Le meilleur spot de Bizerte sans aucun doute. Les photos ne rendent meme pas justice a la beaute du lieu. A refaire absolument !', date: '2026-02-20' },
  { id: 5, userName: 'Amine R.', rating: 4, comment: 'Tres belle decouverte. Les crevettes flambees sont exceptionnelles. Seul bemol : il faut reserver a l\'avance en haute saison.', date: '2026-03-10' },
]

export const allImages = {
  heroImg, overwaterImg, waterSwingImg, hammockImg, cabinImg, cabinHammockImg, surfboardImg, swingImg
}
