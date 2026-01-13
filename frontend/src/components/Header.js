function Header() {
  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between">
      <span className="font-semibold">Sistem Manajemen Stok Koperasi</span>
      <button
        onClick={() => {
          localStorage.removeItem("token");
          window.location.reload();
        }}
        className="text-red-600 font-medium"
      >
        Logout
      </button>
    </header>
  );
}

export default Header;
