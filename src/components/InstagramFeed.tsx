const instagramPhotos = [
  { id: 1, src: "https://images.unsplash.com/photo-1623194120936-093ded27c147?q=80&w=800&auto=format&fit=crop", alt: "Pickleball players on a court" },
  { id: 2, src: "https://images.unsplash.com/photo-1613532414958-691d545198a4?q=80&w=800&auto=format&fit=crop", alt: "Close-up of a pickleball paddle and ball" },
  { id: 3, src: "https://images.unsplash.com/photo-1621451249003-4d4d3c3a0a9a?q=80&w=800&auto=format&fit=crop", alt: "A pickleball paddle leaning against a net" },
  { id: 4, src: "https://images.unsplash.com/photo-1622406283194-a8f7153928a2?q=80&w=800&auto=format&fit=crop", alt: "Two people playing pickleball" },
  { id: 5, src: "https://images.unsplash.com/photo-1596769226358-a055a1009e08?q=80&w=800&auto=format&fit=crop", alt: "Overhead view of a pickleball court" },
  { id: 6, src: "https://images.unsplash.com/photo-1612874426792-b6f3c19a5a4c?q=80&w=800&auto=format&fit=crop", alt: "A person serving in pickleball" },
  { id: 7, src: "https://images.unsplash.com/photo-1637489018429-e8c470795544?q=80&w=800&auto=format&fit=crop", alt: "Action shot of a pickleball paddle hitting a ball" },
  { id: 8, src: "https://images.unsplash.com/photo-1638963443254-f6390a4980c0?q=80&w=800&auto=format&fit=crop", alt: "A group of friends enjoying a game of pickleball" },
];

export default function InstagramFeed() {
  return (
    <div className="bg-gray-50/80">
      <div className="max-w-7xl mx-auto py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Follow Our Pickleball Community</h2>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Join the conversation and see our paddles in action. Tag <a href="https://www.instagram.com/thepaddledepot/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-semibold hover:underline">@thepaddledepot</a> to be featured!
          </p>
        </div>
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          {instagramPhotos.map((photo, index) => (
            <a
              key={photo.id}
              href="https://www.instagram.com/thepaddledepot/"
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative aspect-square overflow-hidden rounded-lg ${index >= 4 ? 'hidden sm:block' : ''}`}
            >
              <img src={photo.src} alt={photo.alt} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300 flex items-center justify-center">
                <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </div>
            </a>
          ))}
        </div>
        <div className="mt-12 text-center">
          <a
            href="https://www.instagram.com/thepaddledepot/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white font-bold text-lg rounded-lg shadow-lg hover:opacity-90 transition-opacity transform hover:-translate-y-1"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            Follow on Instagram
          </a>
        </div>
      </div>
    </div>
  );
}