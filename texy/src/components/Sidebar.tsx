import Link from "next/link";
import { Map, Home, Search, Bookmark } from "lucide-react";

const Sidebar = () => {
  const navItems = [
    { name: "For You", href: "/", icon: Home },
    { name: "Explore", href: "/explore", icon: Search },
    { name: "Saved", href: "/saved", icon: Bookmark },
    { name: "World Map", href: "/world-map", icon: Map },
  ];

  return (
    <div className="w-64 bg-white shadow-md h-screen fixed left-0 top-0 p-4">
      <h2 className="text-xl font-bold mb-8">Newscraper</h2>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
