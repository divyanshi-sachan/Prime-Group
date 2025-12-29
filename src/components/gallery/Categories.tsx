import React from 'react'

const categories = ['ALL', 'GRAPHIC IDENTITY', 'SITE DESIGN', 'AI', 'VIDEO', '3D']

const Categories: React.FC = () => {
  return (
    <div className="fixed top-1/2 right-4 -translate-y-1/2 flex flex-col gap-2 z-50">
      {categories.map((category) => (
        <button
          key={category}
          className="px-4 py-2 bg-black/5 rounded-full hover:bg-black/10 transition-colors text-sm"
        >
          {category}
        </button>
      ))}
    </div>
  )
}

export default Categories

