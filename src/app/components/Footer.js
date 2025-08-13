// components/Footer.js
export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-300 text-center py-4 mt-8">
      <p className="text-sm text-gray-600">
        © {new Date().getFullYear()} Digital Menu Card. All rights reserved.
      </p>
    </footer>
  );
}
// This Footer component can be imported and used in other components or pages.