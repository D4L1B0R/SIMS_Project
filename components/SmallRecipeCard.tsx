import Image from "next/image";
import Link from "next/link";

interface SmallRecipeCardProps {
  id: number;
  title: string;
  image?: string;
}

export default function SmallRecipeCard({ id, title, image }: SmallRecipeCardProps) {
  return (
    <Link href={`/recipe/${id}`} passHref>
      <div className="h-48 w-48 rounded-lg overflow-hidden flex-shrink-0 shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer">
        <div className="h-3/4 w-full">
          {image ? (
            <Image 
              src={image} 
              alt={title} 
              className="w-full h-full object-cover"
              width={192}
              height={144}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
            </div>
          )}
        </div>
        <div className="h-1/4 w-full bg-white flex items-center px-2">
          <h4 className="text-sm font-semibold text-gray-800 truncate w-full text-left">
            {title}
          </h4>
        </div>
      </div>
    </Link>
  );
}