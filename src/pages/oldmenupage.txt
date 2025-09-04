import Header from '../components/Header';
import Footer from '../components/Footer';
import StaticMenu from '../components/StaticMenu';

const MenuPage = () => {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header />
      <StaticMenu />
      <Footer />
    </div>
  );
};

export default MenuPage;
