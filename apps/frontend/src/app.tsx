import { LobbyID } from '../../backend/src/types/server';

import Game from './components/game';
import JoinLobbyForm from './components/join-lobby-form';
import useLobbySocket from './hooks/use-lobby-socket';

function App() {
  const { connected, lobby, createLobby, joinLobby } = useLobbySocket();

  return connected ? (
    <div
      className="w-full h-screen bg-cover text-xl"
      style={{ backgroundImage: 'url("/background.svg")' }}
    >
      {lobby.lobbyId ? (
        <Game {...lobby} />
      ) : (
        <main className="container mx-auto px-6 py-4">
          <img src="/logo.svg" className="h-72 md:absolute" />
          <div className="flex items-center justify-center flex-col h-screen max-h-[960px]">
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
                  joinLobby(lobbyId as LobbyID);
                }}
              />
            </div>
          </div>
        </main>
      )}
    </div>
  ) : (
    <div>Loading...</div>
  );
}

export default App;
