import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-primary">Fruit Habibi</h3>
            <p className="mt-4 text-gray-600">
              Connecting growers with trusted buyers across borders. Building a sustainable 
              future for the global fruits and vegetables trade.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
              Platform
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/listings" className="text-gray-600 hover:text-gray-900">
                  Browse Listings
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-gray-900">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-gray-900">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
              Support
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/help" className="text-gray-600 hover:text-gray-900">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-gray-900">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-gray-900">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Fruit Habibi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
