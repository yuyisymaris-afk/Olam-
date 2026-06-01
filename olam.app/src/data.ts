import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Hamburguesa Súper Delicia',
    description: 'Increíble carne Angus de 150g a la parrilla, delicioso queso cheddar fundido, lechuga fresca, rodajas de tomate y jugosa cebolla caramelizada con nuestra salsa especial de la casa.',
    category: 'Hamburguesas',
    basePrice: 18900,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800',
    baseIngredients: ['Carne Angus 150g', 'Queso Cheddar', 'Lechuga', 'Tomate', 'Cebolla Caramelizada', 'Salsa Especial'],
    extraIngredientsAvailable: [
      { name: 'Tocineta Crujiente', price: 3000 },
      { name: 'Queso Cheddar Extra', price: 2000 },
      { name: 'Carne Angus Extra', price: 6000 },
      { name: 'Huevo Frito', price: 1500 }
    ]
  },
  {
    id: 'p2',
    name: 'Pizza Suprema Mediana',
    description: 'Tradicional salsa de pizza italiana, doble porción de queso mozzarella, rodajas de pepperoni americano, jamón seleccionado, champiñones frescos y un toque de orégano.',
    category: 'Pizzas',
    basePrice: 24900,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800',
    baseIngredients: ['Salsa de Tomate', 'Queso Mozzarella', 'Jamón', 'Pepperoni', 'Champiñones', 'Orégano'],
    extraIngredientsAvailable: [
      { name: 'Extra Mozzarella', price: 3500 },
      { name: 'Borde de Queso', price: 5000 },
      { name: 'Tocineta en Cubos', price: 3000 },
      { name: 'Maiz Dulce', price: 1500 }
    ]
  },
  {
    id: 'p3',
    name: 'Perro Caliente Especial',
    description: 'Salchicha tipo americana gigante de 22cm, bañada en queso mozzarella derretido, papitas cabello de ángel crujientes, cebollita fina, salsa de piña casera y nuestra célebre salsa tártara.',
    category: 'Perros Calientes',
    basePrice: 12900,
    image: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&q=80&w=800',
    baseIngredients: ['Salchicha Gigante 22cm', 'Queso Mozzarella', 'Papa Cabello de Ángel', 'Cebolla Picada', 'Salsa de Piña', 'Salsa Tártara'],
    extraIngredientsAvailable: [
      { name: 'Tocineta Crujiente', price: 3000 },
      { name: 'Huevo de Codorniz (x3)', price: 1500 },
      { name: 'Queso Fundido Extra', price: 2000 }
    ]
  },
  {
    id: 'p4',
    name: 'Maizito Desgranado Especial',
    description: 'Tiernos granos de maíz dulce salteados con mantequilla, acompañados de jugosa pechuga de pollo desmechada, lomo de res ahumado, gratinado con queso costeño y papitas trituradas.',
    category: 'Desgranados',
    basePrice: 21900,
    image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&q=80&w=800', // standard corn/mexican bowl or street food
    baseIngredients: ['Maíz Dulce', 'Pollo Desmechado', 'Lomo de Res', 'Queso Costeño Gratinado', 'Ripios de Papa', 'Salsa de Ajo'],
    extraIngredientsAvailable: [
      { name: 'Chorizo Santarrosano', price: 3500 },
      { name: 'Tocineta Crujiente', price: 3000 },
      { name: 'Salchicha Ranchera', price: 2500 },
      { name: 'Extra Salsa de Ajo', price: 1000 }
    ]
  },
  {
    id: 'p5',
    name: 'Salchipapa Suprema Delicia',
    description: 'Una generosa montaña de papas fritas amarillas, salchicha premium seleccionada, queso mozzarella perfectamente gratinado, ripios crujientes y todas las salsas clásicas.',
    category: 'Salchipapas',
    basePrice: 17900,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=800', // Fries premium mock photo
    baseIngredients: ['Papa Amarilla Crujiente', 'Salchicha Premium', 'Queso Mozzarella', 'Ripios de Papa', 'Salsa Rosada', 'Salsa de Queso'],
    extraIngredientsAvailable: [
      { name: 'Pollo Desmechado', price: 4000 },
      { name: 'Carne Desmechada', price: 4500 },
      { name: 'Huevo Frito Chorreante', price: 1500 },
      { name: 'Guacamole Casero', price: 2500 }
    ]
  }
];
