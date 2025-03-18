
import { Link } from "react-router-dom";
import { Car, Bike, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                <Car className="h-6 w-6 text-brand-lightBlue" />
                <Bike className="h-5 w-5 text-brand-green" />
              </div>
              <span className="font-bold text-xl">E-Hire</span>
            </Link>
            <p className="text-gray-400 mb-4">
              Connecting vehicle owners with renters for a seamless, 
              secure, and sustainable mobility experience.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/vehicles?type=car" className="text-gray-400 hover:text-white transition-colors">
                  Cars
                </Link>
              </li>
              <li>
                <Link to="/vehicles?type=bike" className="text-gray-400 hover:text-white transition-colors">
                  Bikes
                </Link>
              </li>
              <li>
                <Link to="/list-vehicle" className="text-gray-400 hover:text-white transition-colors">
                  List Your Vehicle
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-400 hover:text-white transition-colors">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Insurance & Safety
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Renter Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Owner Resources
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-brand-green shrink-0 mt-0.5" />
                <span className="text-gray-400">
                  123 Wheel Street, Mobility City, MC 12345
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-brand-green shrink-0" />
                <span className="text-gray-400">
                  (555) 123-4567
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-brand-green shrink-0" />
                <span className="text-gray-400">
                  support@wheelshare.com
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-6 text-center text-gray-500">
          <p>© {new Date().getFullYear()} WheelShare Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
