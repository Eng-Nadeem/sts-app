import { BoltIcon, UserCircleIcon } from "lucide-react";
import { Link } from "wouter";

const Header = () => {
  return (
    <header className="bg-primary text-white px-4 py-3 shadow-md sticky top-0 z-10">
      <div className="flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center">
            <BoltIcon className="mr-2 h-5 w-5" />
            <h1 className="text-xl font-bold">PowerPay</h1>
          </div>
        </Link>
        <Link href="/profile">
          <div className="p-2">
            <UserCircleIcon className="h-6 w-6" />
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
