import Game from './components/game';
import JoinLobbyForm from './components/join-lobby-form';
import useLobbySocket from './hooks/use-lobby-socket';

function App() {
  const { connected, lobby, createLobby, joinLobby } = useLobbySocket();

  return connected ? (
    <>
      <div
        className="fixed w-screen h-screen bg-cover bg-center"
        style={{ backgroundImage: 'url("/background.svg")' }}
      />
      <div className="relative text-xl">
        {lobby.lobbyId ? (
          <Game {...lobby} />
        ) : (
          <main className="container mx-auto px-6 py-4">
            <img src="/logo.svg" className="h-72 xl:absolute" />
            <div className="flex items-center justify-center max-xl:mt-12 flex-col xl:h-screen max-h-[960px]">
              <button
                type="button"
                onClick={() => {
                  createLobby('Thomas');
                }}
                className="bg-white/90 hover:bg-white/80 px-6 py-3 text-xl rounded-2xl transition-colors"
              >
                Create Lobby
              </button>
              <div className="mt-4 text-white/75">or</div>
              <div className="mt-4">
                <JoinLobbyForm
                  onSubmit={({ lobbyId }) => {
                    joinLobby(lobbyId as string);
                  }}
                />
              </div>
            </div>
          </main>
        )}
      </div>
    </>
  ) : (
    <div className=" h-screen flex items-center justify-center text-white text-xl animate-pulse">
      Loading...
    </div>
  );
}

export default App;
