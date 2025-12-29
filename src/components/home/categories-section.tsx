'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ShoppingCart, ChevronLeft, ChevronRight, Heart, ExternalLink } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  link: string
}

const productsByCategory: Record<string, Product[]> = {
  'Occasions': [
    {
      id: '1',
      name: 'Wedding',
      description: 'Because your big day deserves more than just good enough shots.',
      price: 199.99,
      image: 'https://bangalorephotographers.in/blog/wp-content/uploads/2022/08/Wedding-Photography-e1661455773277.jpg',
      link: '/packages/occasions'
    },
    {
      id: '2',
      name: 'Maternity',
      description: 'For the moms who glow like a sunrise but want photos sharper than your morning coffee',
      price: 149.99,
      image: 'https://matrixstudio.in/cdn/images/album/maternity049.jpg',
      link: '/packages/occasions'
    },
    {
      id: '3',
      name: 'Baby Shower',
      description: 'Babies might be messy, but your baby shower photos dont have to be',
      price: 399.99,
      image: 'https://media.greatbigphotographyworld.com/wp-content/uploads/2020/06/newborn-ideas-and-tips.jpg',
      link: '/packages/occasions'
    },
    {
      id: '4',
      name: 'Parties-Events',
      description: 'When the partys wild, but your Insta feed is mild',
      price: 129.99,
      image: 'https://i1.adis.ws/i/canon/adobestock_173678266_4b5c9fe2848a40d68964c61a4d775304',
      link: '/packages/occasions'
    },
  ],
  'Business': [
    {
      id: '5',
      name: 'Brand Shoot',
      description: 'Let us make your brand the Beyoncé of your industry—flawless',
      price: 99.99,
      image: 'https://thebrandbee.com/assets/imgs/Brand-solution/Photoshoots-Video-Shoots/850X400.webp',
      link: '/packages/business'
    },
    {
      id: '6',
      name: 'Corporate Profile And Headshot',
      description: 'We re here to make you look CEO-level sharp',
      price: 179.99,
      image: 'https://i.pinimg.com/736x/72/3a/af/723aaf860c79a2599f8c171edde215ec.jpg',
      link: '/packages/business'
    },
    {
      id: '7',
      name: 'Political Profile And Headshot',
      description: 'We make you look powerful—without the scandal',
      price: 49.99,
      image: 'https://images.squarespace-cdn.com/content/v1/5c4d7e227e3c3a6ec70a5ac7/1699872724564-E3QTF3JO8N15F5EMNM8D/David+Cameron+Rory+Lewis+Photographer.jpg?format=1000w',
      link: '/packages/business'
    },
    {
      id: '8',
      name: 'Portfolio',
      description: 'We ll make sure your portfolio is giving main character energy',
      price: 39.99,
      image: 'https://portfoliofashion.com/wp-content/uploads/2024/01/Modeling-Portfolio-Photographer-Bangalore.jpg',
      link: '/packages/business'
    },
  ],
};

export default function ProductCatalog() {
  const router = useRouter();
  const categories = Object.keys(productsByCategory);
  const [currentCategory, setCurrentCategory] = useState(0);
  const [products, setProducts] = useState<Product[]>(productsByCategory[categories[currentCategory]]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  // const [addedToCart, setAddedToCart] = useState<Set<string>>(new Set())
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  useEffect(() => {
    setProducts(productsByCategory[categories[currentCategory]]);
  }, [currentCategory]);

  function toRoute(route: string) {
    router.push(route)
  }

  function toggleFavorite(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  }
  return (
    <div className="container mx-auto px-4 py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="text-center mb-16">
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-full shadow-lg">
            <span className="text-base font-black tracking-wide">HOT PACKAGES</span>
          </div>
        </motion.div>

        <motion.div 
          className="relative mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex justify-between items-center">
            <Button 
              onClick={() => setCurrentCategory((prev) => (prev - 1 + categories.length) % categories.length)}
              variant="outline"
              size="icon"
              className="rounded-full border-2 border-purple-500 text-purple-600 hover:bg-purple-50"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Previous category</span>
            </Button>
            
            <AnimatePresence mode="wait">
              <motion.h2 
                key={categories[currentCategory]}
                className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {categories[currentCategory]}
              </motion.h2>
            </AnimatePresence>
            
            <Button 
              onClick={() => setCurrentCategory((prev) => (prev + 1) % categories.length)}
              variant="outline"
              size="icon"
              className="rounded-full border-2 border-purple-500 text-purple-600 hover:bg-purple-50"
            >
              <ChevronRight className="h-5 w-5" />
              <span className="sr-only">Next category</span>
            </Button>
          </div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"></div>
        </motion.div>

        <motion.p 
          className="text-gray-600 max-w-2xl mx-auto text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Capture life's precious moments with our professional photography packages, tailored to your unique story.
        </motion.p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={currentCategory}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
            >
              <Card 
                className="overflow-hidden border-0 shadow-lg rounded-xl bg-white"
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
                onClick={() => toRoute(product.link)}
              >
                <CardContent className="p-0 relative">
                  <div className="relative overflow-hidden group">
                    <div className="relative h-64 w-full">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                        style={{ objectPosition: 'center' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className={`rounded-full border-0 bg-white/80 backdrop-blur-sm hover:bg-white ${favorites.has(product.id) ? 'text-red-500' : 'text-gray-700'}`}
                        onClick={(e) => toggleFavorite(product.id, e)}
                      >
                        <Heart className={`h-5 w-5 ${favorites.has(product.id) ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                    
                    <motion.div 
                      className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                      animate={{ y: hoveredProduct === product.id ? 0 : '100%' }}
                    >
                      <p className="text-sm font-medium">{product.description}</p>
                      <div className="mt-2 flex justify-between items-center">
                        <Badge className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30">
                          ${product.price.toFixed(2)}
                        </Badge>
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full px-4"
                        >
                          Explore <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </motion.div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                    <div className="h-1 w-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mt-2 mb-2"></div>
                    <p className="text-gray-500">${product.price.toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}