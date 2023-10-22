function App() {
  return (
    <main className="container mx-auto pt-12">
      <p>Hello!</p>
      <button
        type="button"
        className="bg-blue-500 px-8 py-1 rounded-md text-white"
        onClick={async () => {
          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/`, {
            method: 'GET',
          });
          console.log(await res.json());
        }}
      >
        Ping
      </button>
    </main>
  );
}

export default App;
