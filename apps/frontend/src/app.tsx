import { useState } from 'react';

import DisplayNameInput from './components/display-name-input';
import Game from './components/game';
import JoinLobbyForm from './components/join-lobby-form';
import useLobbySocket from './hooks/use-lobby-socket';

function App() {
  const {
    connected,
    lobby,
    createLobby,
    joinLobby,
    leaveLobby,
    setDisplayName,
  } = useLobbySocket();

  const [hasName, setHasName] = useState(false);

  return connected ? (
    <>
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url("/img/background.svg")' }}
      />
      <div className="relative text-xl">
        {lobby.lobbyId ? (
          <Game
            {...lobby}
            leaveLobby={() => {
              leaveLobby();
            }}
          />
        ) : (
          <main className="container mx-auto px-6 py-4">
            <img src="/img/logo.svg" className="h-72 xl:absolute" />
            <div className="flex items-center justify-center max-xl:mt-12 flex-col xl:h-screen max-h-[960px]">
              {hasName ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      createLobby('Thomas');
                    }}
                    className="bg-yellow-100 hover:bg-yellow-100/90 px-6 py-3 text-xl rounded-2xl transition-colors"
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
                </>
              ) : (
                <DisplayNameInput
                  onSubmit={({ displayName }) => {
                    setDisplayName(displayName);
                    setHasName(true);
                  }}
                />
              )}
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
